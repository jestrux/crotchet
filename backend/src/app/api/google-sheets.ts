import { env } from "cloudflare:workers";
import crawlUrl from "./crawl";

async function getSheetDetailsSimple(url: string) {
	try {
		url = decodeURIComponent(url);
	} catch (e) {
		// URL already decoded
	}

	const spreadsheetId = extractSpreadsheetId(url);

	if (!spreadsheetId) {
		throw new Error("Invalid Google Sheets URL");
	}

	// return { html: (await crawlUrl(url)).data };

	// Fetch the HTML page directly
	const pageUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
	const response = await fetch(pageUrl);

	if (!response.ok) {
		throw new Error(`Failed to fetch sheet: ${response.statusText}`);
	}

	const html = await response.text();

	// Extract title from HTML (in <title> tag or og:title meta)
	const titleMatch = html.match(/<title>(.*?)<\/title>/i);
	const title = titleMatch
		? titleMatch[1]
				.replace(" - Google Sheets", "")
				.replace(" - Majedwali ya Google", "")
				.trim()
		: "Untitled";

	// Extract sheet tabs from bootstrapData
	const sheets: any[] = [];

	// Extract from bootstrapData.changes.topsnapshot
	// Pattern: [21350203,"[INDEX,0,\"SHEET_ID\",[{\"1\":[[0,0,\"SHEET_NAME\"
	const sheetPattern =
		/\[21350203,\\".*?\[(\d+),0,\\\\"(\d+)\\\\".*?\[\[0,0,\\\\"([^\\\\"]+)\\\\"/g;
	const matches = [...html.matchAll(sheetPattern)];

	if (matches.length > 0) {
		matches.forEach((match) => {
			const index = parseInt(match[1]);
			const sheetId = parseInt(match[2]);
			const title = match[3];

			sheets.push({
				title,
				sheetId,
				index,
			});
		});

		// Sort by index to ensure correct order
		sheets.sort((a, b) => a.index - b.index);
	}

	// Fallback: try gridId from bootstrapData (at least gives us the first sheet)
	if (sheets.length === 0) {
		const gridIdMatch = html.match(/"gridId":(\d+)/);
		if (gridIdMatch) {
			sheets.push({
				title: "Sheet1",
				sheetId: parseInt(gridIdMatch[1]),
				index: 0,
			});
		}
	}

	// Last resort: add a default sheet
	if (sheets.length === 0) {
		sheets.push({
			title: "Sheet1",
			sheetId: 0,
			index: 0,
		});
	}

	return {
		spreadsheetId,
		title,
		sheets,
		url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
		simple: true,
		// html,
	};
}

function extractSpreadsheetId(url: string): string | null {
	// Handle various Google Sheets URL formats
	const patterns = [
		/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
		/^([a-zA-Z0-9-_]+)$/, // Just the ID
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}

	return null;
}

async function getSheetDetails(url: string, options?: { simple?: boolean }) {
	// Use simple mode if requested
	if (options?.simple) {
		return getSheetDetailsSimple(url);
	}

	try {
		url = decodeURIComponent(url);
	} catch (e) {
		// URL already decoded
	}

	const spreadsheetId = extractSpreadsheetId(url);

	if (!spreadsheetId) {
		throw new Error("Invalid Google Sheets URL");
	}

	// Fetch spreadsheet metadata with full details including formatting and data validation
	// const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=true&key=${env.GOOGLE_SHEETS_API_KEY}`;
	const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${env.GOOGLE_SHEETS_API_KEY}`;

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch sheet details: ${response.statusText}`
		);
	}

	const data: any = await response.json();

	// Extract basic information and column data with formatting/validation for each sheet
	const tabs = (data.sheets || []).map((sheet: any) => {
		const sheetTitle = sheet.properties.title;
		const sheetId = sheet.properties.sheetId;

		// Get conditional formatting rules for this sheet
		const conditionalFormats = sheet.conditionalFormats || [];

		// Get the first row from grid data (headers)
		const firstRowData = sheet.data?.[0]?.rowData?.[0]?.values || [];

		// Extract columns with their formatting and validation
		const columns = firstRowData
			.map((cell: any, index: number) => {
				const headerValue =
					cell.formattedValue ||
					cell.effectiveValue?.stringValue ||
					"";

				// Skip empty columns
				if (!headerValue.trim()) {
					return null;
				}

				const columnInfo: any = {
					name: headerValue,
					index,
					letter: indexToColumnLetter(index),
				};

				// Extract formatting information
				if (cell.effectiveFormat) {
					const format = cell.effectiveFormat;
					columnInfo.formatting = {
						...(format.backgroundColor && {
							backgroundColor: rgbToHex(format.backgroundColor),
						}),
						...(format.textFormat && {
							textFormat: {
								...(format.textFormat.foregroundColor && {
									foregroundColor: rgbToHex(
										format.textFormat.foregroundColor
									),
								}),
								bold: format.textFormat.bold || false,
								italic: format.textFormat.italic || false,
								strikethrough:
									format.textFormat.strikethrough || false,
								underline: format.textFormat.underline || false,
								...(format.textFormat.fontSize && {
									fontSize: format.textFormat.fontSize,
								}),
								...(format.textFormat.fontFamily && {
									fontFamily: format.textFormat.fontFamily,
								}),
							},
						}),
						...(format.numberFormat && {
							numberFormat: {
								type: format.numberFormat.type,
								pattern: format.numberFormat.pattern,
							},
						}),
						...(format.horizontalAlignment && {
							horizontalAlignment: format.horizontalAlignment,
						}),
						...(format.verticalAlignment && {
							verticalAlignment: format.verticalAlignment,
						}),
					};
				}

				// Extract data validation for the column (check cells below header)
				// We'll check if there's a consistent validation rule in the column
				const columnCells =
					sheet.data?.[0]?.rowData
						?.slice(1)
						.map((row: any) => row.values?.[index]) || [];
				const validationRules = columnCells
					.map((cell: any) => cell?.dataValidation)
					.filter((v: any) => v);

				if (validationRules.length > 0) {
					// Use the first validation rule found
					const validation = validationRules[0];
					columnInfo.dataValidation = {
						...(validation.condition && {
							condition: {
								type: validation.condition.type,
								...(validation.condition.values && {
									values: validation.condition.values.map(
										(v: any) =>
											v.userEnteredValue || v.relativeDate
									),
								}),
							},
						}),
						strict: validation.strict || false,
						showCustomUi: validation.showCustomUi || false,
						...(validation.inputMessage && {
							inputMessage: validation.inputMessage,
						}),
					};
				}

				// Extract conditional formatting rules that apply to this column
				const columnConditionalFormats = conditionalFormats.filter(
					(rule: any) => {
						const ranges = rule.ranges || [];
						return ranges.some((range: any) => {
							// Check if this range includes our column
							const startCol = range.startColumnIndex || 0;
							const endCol = range.endColumnIndex || 999999;
							return index >= startCol && index < endCol;
						});
					}
				);

				if (columnConditionalFormats.length > 0) {
					columnInfo.conditionalFormatting =
						columnConditionalFormats.map((rule: any) => {
							const result: any = {
								ranges: rule.ranges?.map((range: any) => ({
									startRowIndex: range.startRowIndex,
									endRowIndex: range.endRowIndex,
									startColumnIndex: range.startColumnIndex,
									endColumnIndex: range.endColumnIndex,
								})),
							};

							// Extract boolean rule (for simple conditional formatting)
							if (rule.booleanRule) {
								result.type = "boolean";
								result.condition = {
									type: rule.booleanRule.condition?.type,
									...(rule.booleanRule.condition?.values && {
										values: rule.booleanRule.condition.values.map(
											(v: any) =>
												v.userEnteredValue ||
												v.relativeDate
										),
									}),
								};
								if (rule.booleanRule.format) {
									result.format = {
										...(rule.booleanRule.format
											.backgroundColor && {
											backgroundColor: rgbToHex(
												rule.booleanRule.format
													.backgroundColor
											),
										}),
										...(rule.booleanRule.format
											.textFormat && {
											textFormat: {
												...(rule.booleanRule.format
													.textFormat
													.foregroundColor && {
													foregroundColor: rgbToHex(
														rule.booleanRule.format
															.textFormat
															.foregroundColor
													),
												}),
												bold: rule.booleanRule.format
													.textFormat.bold,
												italic: rule.booleanRule.format
													.textFormat.italic,
											},
										}),
									};
								}
							}

							// Extract gradient rule (for color scales)
							if (rule.gradientRule) {
								result.type = "gradient";
								result.minpoint = rule.gradientRule
									.minpoint && {
									color: rgbToHex(
										rule.gradientRule.minpoint.color
									),
									type: rule.gradientRule.minpoint.type,
								};
								result.midpoint = rule.gradientRule
									.midpoint && {
									color: rgbToHex(
										rule.gradientRule.midpoint.color
									),
									type: rule.gradientRule.midpoint.type,
								};
								result.maxpoint = rule.gradientRule
									.maxpoint && {
									color: rgbToHex(
										rule.gradientRule.maxpoint.color
									),
									type: rule.gradientRule.maxpoint.type,
								};
							}

							return result;
						});
				}

				return columnInfo;
			})
			.filter((col: any) => col !== null);

		return {
			name: sheetTitle,
			gid: sheetId,
			// index: sheet.properties.index,
			// gridProperties: sheet.properties.gridProperties,
			// columns,
		};
	});

	return {
		spreadsheetId: data.spreadsheetId,
		title: data.properties?.title || "Untitled",
		locale: data.properties?.locale,
		timeZone: data.properties?.timeZone,
		tabs,
		url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
	};
}

// Helper function to convert column index to letter (0 -> A, 25 -> Z, 26 -> AA, etc.)
function indexToColumnLetter(index: number): string {
	let letter = "";
	while (index >= 0) {
		letter = String.fromCharCode((index % 26) + 65) + letter;
		index = Math.floor(index / 26) - 1;
	}
	return letter;
}

// Helper function to convert Google Sheets RGB color to hex
function rgbToHex(color: any): string {
	if (!color) return "#000000";

	const r = Math.round((color.red || 0) * 255);
	const g = Math.round((color.green || 0) * 255);
	const b = Math.round((color.blue || 0) * 255);

	return `#${r.toString(16).padStart(2, "0")}${g
		.toString(16)
		.padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export { getSheetDetails, getSheetDetailsSimple };
