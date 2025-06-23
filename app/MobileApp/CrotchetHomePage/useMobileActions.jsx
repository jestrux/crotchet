import { useDataLoader } from "@/crotchet/hooks";
import {
	camelCaseToSentenceCase,
	dispatch,
	getPreference,
	savePreference,
	sectionedChoices,
} from "@/crotchet/utils";
import { useState } from "react";

export const useMobileActions = () => {
	const [searchQuery, setSearchQuery] = useState();
	const { data: actions, refetch } = useDataLoader({
		handler: window.globalActions,
		listenForUpdates: "extensions-updated",
	});

	const toggleMultipleHomePageEntry = async (entries) => {
		const homePageContent = await getPreference("homePageContent", []);
		entries.forEach(({ selected, value }) => {
			const existingIndex = homePageContent
				.map((entry) => entry.name)
				.indexOf(value);
			if (existingIndex != -1) {
				if (!selected) homePageContent.splice(existingIndex, 1);
			} else if (selected) homePageContent.push({ name: value });
		});

		await savePreference("homePageContent", homePageContent);

		dispatch("home-page-content-updated");
	};

	const actionSections = sectionedChoices(
		[
			...[
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
							/>
						</svg>
					),
					label: "Clipboard",
					handler: async () => {
						try {
							const { type, value } =
								await window.readClipboard();
							const { payload, preview } =
								window.processShareData(value, type, {
									fromClipboard: true,
								}) || {};

							if (!payload)
								return window.showToast("Nothing in clipboard");

							return window.openActionSheet({
								// title: "Select an action",
								payload,
								preview,
							});
						} catch (error) {
							window.showToast(error);
							// console.log("Clipboard error: ", error);
						}
					},
					pinned: 1,
					section: "Quick Actions",
				},
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4.5v15m7.5-7.5h-15"
							/>
						</svg>
					),
					label: "Add Widgets",
					handler: async () => {
						const homePageContent = await getPreference(
							"homePageContent",
							[]
						);
						const contentNames = homePageContent.map(
							(entry) => entry.name
						);

						const choices = _.orderBy(
							_.keys(window.widgets).reduce((agg, item) => {
								const key = "widget" + item;
								let idx = contentNames.indexOf(key);
								if (idx == -1) idx = 100;

								if (!contentNames.includes(key)) {
									agg.push({
										idx,
										label: camelCaseToSentenceCase(item),
										value: key,
									});
								}

								return agg;
							}, []),
							["idx"]
						);

						window.openChoicePicker({
							title: "Select Widgets",
							multiple: true,
							emptyStateMessage: "No unused widgets",
							choices,
							onChange: toggleMultipleHomePageEntry,
						});
					},
					pinned: 1,
					section: "Home Page",
				},
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4.5v15m7.5-7.5h-15"
							/>
						</svg>
					),
					label: "Add Sections",
					handler: async () => {
						const homePageContent = await getPreference(
							"homePageContent",
							[]
						);
						const contentNames = homePageContent.map(
							(entry) => entry.name
						);

						window.openChoicePicker({
							title: "Select Sections",
							multiple: true,
							emptyStateMessage: "No unused sections",
							choices: _.orderBy(
								_.keys(window.sections).reduce((agg, item) => {
									const key = "section" + item;
									let idx = contentNames.indexOf(key);
									if (idx == -1) idx = 100;

									if (!contentNames.includes(key)) {
										agg.push({
											idx,
											label: camelCaseToSentenceCase(
												item
											),
											value: key,
										});
									}

									return agg;
								}, []),
								["idx"]
							),
							onChange: toggleMultipleHomePageEntry,
						});
					},
					pinned: 1,
					section: "Home Page",
				},
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4.499 8.248h15m-15 7.501h15"
							/>
						</svg>
					),
					label: "Customize",
					handler: async () => {
						const homePageContent = await getPreference(
							"homePageContent",
							[]
						);

						const choices = homePageContent.map((item) => {
							const label = camelCaseToSentenceCase(
								item.name.substring(
									item.name.startsWith("widget") ? 6 : 7
								)
							);

							return {
								label,
								value: item.name,
								selected: true,
							};
						});

						window.openChoicePicker({
							title: "Customize Home Page",
							emptyStateMessage: "No sections added",
							sortable: choices.length > 1,
							multiple: true,
							choices,
							onChange: async (values) => {
								const homePageContent = values
									.filter((v) => v.selected)
									.map(({ value }) => ({
										name: value,
									}));

								await savePreference(
									"homePageContent",
									homePageContent
								);

								dispatch("home-page-content-updated");
							},
						});
					},
					pinned: 1,
					section: "Home Page",
				},
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
							/>
						</svg>
					),
					label: "App Navigation",
					handler: () => {
						window.openActionSheet({
							title: "Customize Navigation",
							content:
								"Customize Navigation details will go here...",
						});
					},
					pinned: 1,
					section: "App",
				},
			],
			...(actions || []).reduce((agg, a) => {
				if (!a.context) {
					agg.push({
						...a,
						pinned: 0,
						section: "All Actions",
					});
				}

				return agg;
			}, []),
		],
		searchQuery
	);

	return {
		searchQuery,
		setSearchQuery,
		actions,
		actionSections,
		refetch,
	};
};
