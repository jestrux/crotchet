import { useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "../providers/AppProvider";
import { AirtableService, useAirtableMutation } from "../hooks/useAirtable";
import ActionPane from "./ModalPanes/ActionPane";
import SettingButton from "./SettingButton";
import ComboboxItem from "./ComboboxItem";
import NavigationButton from "./NavigationButton";
import { useRef } from "react";

function PreferencesEditor(props) {
	const queryTables = useRef(
		AirtableService.fetchTables().then((res) => {
			queryTables.current = res;
			return res;
		})
	);
	const queryClient = useQueryClient();
	const {
		user,
		withToast,
		confirmAction,
		updateUser,
		currentPage,
		setCurrentPage,
		logout,
	} = useAppContext();
	const preferences = user.preferences;

	const pages = [
		{ label: "Home", simpleGrid: user.preferences?.simpleGrid },
		...user.pages,
	];
	const pageProps = pages.find((p) => p.label === currentPage);
	const simpleGrid = pageProps?.simpleGrid ?? true;

	const { mutateAsync } = useAirtableMutation({
		table: "widgets",
		action: "create",
	});

	const refreshWidgets = async ({ invalidate } = {}) => {
		document.dispatchEvent(new CustomEvent("widgets-updated"));

		if (!invalidate) return;

		await withToast(queryClient.invalidateQueries());
		document.dispatchEvent(new CustomEvent("widgets-updated"));
	};

	const fetchTables = async () => {
		return typeof queryTables.current?.then == "function"
			? await queryTables.current()
			: queryTables.current;
	};

	const tableNames = async () => {
		return (await fetchTables()).map(({ name }) => name);
	};

	const tableFields = async ({ data }) => {
		const _tables = await fetchTables();

		if (!data?.table || !_tables.length) return [];

		const table = _tables.find(({ name }) => name == data.table);
		if (table?.fields?.length) {
			return table.fields.filter(
				({ type }) => type.indexOf("multiple") == -1
			);
		}

		return [];
	};

	const selectedTableSchema = async (data) => {
		const res = await tableFields({ data });

		if (!res) return null;

		return res.reduce(
			(agg, { name, type }) => ({ ...agg, [name]: type }),
			{}
		);
	};

	const fieldMappingChoices = async ({ data, key }) => {
		return (await tableFields({ data })).map(({ name }) => name);
	};

	return (
		<ActionPane {...props} hideCloseButton>
			<div className="-m-4">
				<SettingButton
					label="Hide top navigation"
					value={preferences?.hideTopNav}
					onChange={(hideTopNav) =>
						updateUser({
							preferences: { ...preferences, hideTopNav },
						})
					}
				/>

				<SettingButton
					label="wallpaper"
					value={preferences?.wallpaper}
					onChange={(wallpaper) =>
						updateUser({
							preferences: { ...preferences, wallpaper },
						})
					}
				/>

				<SettingButton
					label="simpleGrid"
					value={simpleGrid}
					onChange={(simpleGrid) =>
						updateUser(
							currentPage === "Home"
								? {
										preferences: {
											...preferences,
											simpleGrid,
										},
								  }
								: {
										pages: user.pages.map((p) => {
											if (p.label === pageProps.label) {
												return {
													...pageProps,
													simpleGrid,
												};
											}
											return p;
										}),
								  }
						)
					}
				/>

				{currentPage !== "Home" && (
					<ComboboxItem
						value="Delete current page"
						onSelect={async () => {
							if (
								!(await confirmAction({
									message:
										"This will also delete your widgets in this page.",
								}))
							)
								return;

							setCurrentPage("Home");
							updateUser({
								pages: user.pages.filter(
									({ label }) => label !== currentPage
								),
							});
							props.onClose();
						}}
						trailing="Click to delete"
					/>
				)}

				<ComboboxItem
					value="Refresh Widgets"
					onSelect={async () => {
						refreshWidgets({ invalidate: true });
						props.onClose();
					}}
					trailing="Click to refresh"
				/>

				<NavigationButton
					inset
					title={
						"Add widget " +
						(currentPage !== "Home" ? " to " + currentPage : "")
					}
					fields={{
						label: {
							label: "Widget title",
							type: "text",
							width: "half",
							optional: true,
						},
						size: {
							label: "Widget size",
							type: "choice",
							width: "half",
							choices: [
								"Auto",
								"Square",
								"Wide",
								"Tall",
								"Large",
							],
							defaultValue: "Auto",
						},
						source: {
							label: "Data Source",
							type: "radio",
							choices: [
								"Airtable",
								// "Pier",
								// "Web API"
							],
							width: "half",
							defaultValue: "Airtable",
							group: "Widget Data",
						},
						table: {
							label: "Data Table",
							type: "choice",
							width: "half",
							group: "Widget Data",
							show: (data) => data.source === "Airtable",
							// choices: ["departments", "projects"],
							choices: tableNames,
						},
						model: {
							label: "Pier Model",
							type: "text",
							width: "half",
							group: "Widget Data",
							show: (data) => data.source === "Pier",
						},
						apiUrl: {
							label: "API URL",
							type: "text",
							width: "half",
							group: "Widget Data",
							show: (data) => data.source === "Web API",
						},
						filterable: {
							label: "Filter data",
							type: "boolean",
							helper: true,
							group: "Widget Data",
						},
						filters: {
							hideLabel: true,
							type: "keyvalue",
							key: (data) => data?.table,
							show: (data) => data.filterable,
							group: "Widget Data",
							meta: {
								schema: selectedTableSchema,
							},
						},
						fields: {
							label: "Field mappings",
							type: "keyvalue",
							defaultValue: {
								title: "",
								"": "",
							},
							key: (data) => data?.table,
							meta: {
								// editable: false,
								schema: {
									image: "image",
									title: "text",
									subtitle: "text",
									progress: "number",
									status: "status",
									action: "url",
								},
								choices: fieldMappingChoices,
							},
							group: "Widget Content",
						},
						checkable: {
							label: "Is checklist",
							type: "boolean",
							width: "half",
							helper: true,
							group: "Widget Content",
						},
						checkbox: {
							hideLabel: true,
							placeholder: "Check field...",
							width: "half",
							show: (data) => data.checkable,
							group: "Widget Content",
						},
						removable: {
							type: "boolean",
							group: "Widget Content",
						},
						hasAction: {
							hideLabel: true,
							type: "radio",
							defaultValue: false,
							choices: [
								{ label: "No action", value: false },
								{ label: "Add action", value: true },
							],
							width: "half",
							helper: true,
							group: "Widget Action",
						},
						actionLabel: {
							hideLabel: true,
							type: "text",
							width: "half",
							placeholder: "Action label",
							show: (data) => data.hasAction,
							group: "Widget Action",
						},
						actionFields: {
							label: "Action fields",
							type: "keyvalue",
							// hideLabel: true,
							// noMargin: true,
							show: (data) => data.hasAction,
							group: "Widget Action",
						},
						page: {
							type: "hidden",
							defaultValue: currentPage,
						},
						owner: "authUser",
					}}
					onSave={(data) => {
						let {
							label,
							page,
							owner,
							filters,
							fields,
							actionLabel,
							actionFields,
							...properties
						} = data;

						try {
							fields = JSON.parse(fields ?? {});
						} catch (error) {
							fields = {};
						}

						try {
							filters = JSON.parse(filters ?? {});
						} catch (error) {
							filters = {};
						}

						try {
							actionFields = JSON.parse(actionFields ?? {});
						} catch (error) {
							actionFields = null;
						}

						properties = {
							...properties,
							...fields,
							filters,
							...(actionLabel &&
							actionFields &&
							Object.keys(actionFields).length
								? {
										actions: {
											[actionLabel]: {
												fields: actionFields,
											},
										},
								  }
								: {}),
						};

						const payload = {
							label,
							page,
							owner,
							// properties,
							properties: JSON.stringify(properties),
						};

						// console.log("Payload: ", payload);

						return mutateAsync(payload);
					}}
					onSuccess={refreshWidgets}
				/>

				<NavigationButton
					inset
					title="Add page"
					fields={{
						label: "text",
					}}
					onSave={(page) => {
						updateUser({ pages: [...user.pages, page] });
						setCurrentPage(page.label);
					}}
				/>

				{preferences?.hideTopNav && (
					<ComboboxItem
						value="Logout"
						onSelect={() => {
							logout();
							props.onClose();
						}}
					/>
				)}
			</div>
		</ActionPane>
	);
}

export default function usePreferenceEditor() {
	const preferencesAlertRef = useRef();

	const { showAlert } = useAppContext();

	const editUserPreferences = () => {
		if (preferencesAlertRef.current) {
			preferencesAlertRef.current.close();
			preferencesAlertRef.current = null;
			return;
		}

		showAlert({
			// 	type: "settings",
			// title: "Edit preferences",
			// hideCloseButton: true,
			// showOverlayBg: false,
			size: "xl",
			dismissible: false,
			content: <PreferencesEditor />,
			onCreate(alert) {
				preferencesAlertRef.current = alert;
			},
			callback(data) {
				preferencesAlertRef.current = null;
				return data;
			},
		});
	};

	return { editUserPreferences };
}
