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

	const clipboardAction = () => {
		return {
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
			url: "crotchet://action/clipboard",
			pinned: 1,
			section: "Quick Actions",
		};
	};

	const customizeShortcuts = () => {
		return {
			label: "Customize Shortcuts",
			handler: async () => {
				const savedShortcuts = await getPreference(
					"homePageShortcuts",
					["clipboard"]
				);
				const allShortcuts = window.globalActions?.() ?? [];

				window.openAlertForm({
					title: "Customize Shortcuts",
					fields: {
						style: {
							type: "radio",
							label: "Shortcut Style",
							choices: ["grid", "wrap"],
						},
						shortcuts: {
							type: "radio",
							multiple: true,
							sortable: true,
							choices: _.orderBy(
								[
									"clipboard",
									..._.map(allShortcuts, "name"),
								].map((name) => ({
									selected: savedShortcuts.includes(name),
									idx: savedShortcuts.indexOf(name),
									label: camelCaseToSentenceCase(name),
									value: name,
								})),
								["selected", "idx"],
								"desc"
							),
						},
					},
					data: {
						shortcuts: savedShortcuts,
						style: await getPreference("homePageShortcutStyle", [
							"grid",
						]),
					},
					onChange: async (values) =>
						Promise.all([
							await savePreference(
								"homePageShortcuts",
								values.shortcuts
							),
							await savePreference(
								"homePageShortcutStyle",
								values.style
							),
						]).then(() =>
							window.dispatch("home-page-shortcuts-updated")
						),
				});
			},
			pinned: 1,
			section: "Home Page",
		};
	};

	const customizeWidgetsAction = () => {
		const preferenceKey = "homePageContent";

		return {
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
			label: "Customize Widgets",
			handler: async () => {
				const homePageContent = await getPreference(
					"homePageContent",
					[]
				);
				const choices = _.orderBy(
					_.keys(window.widgets).reduce((agg, item) => {
						const key = "widget~#~" + item;

						agg.push({
							label: camelCaseToSentenceCase(item),
							value: key,
							selected: homePageContent.includes(key),
							idx: homePageContent.indexOf(key),
						});

						return agg;
					}, []),
					["selected", "idx"]
				);

				window.openChoicePicker({
					title: "Customize Widgets",
					emptyStateMessage: "No widgets available",
					sortable: choices.length > 1,
					multiple: true,
					choices,
					onChange: async (values) => {
						const homePageContent = values
							.filter((v) => v.selected)
							.map(({ value }) => value);

						await savePreference(preferenceKey, homePageContent);

						dispatch("home-page-content-updated");
					},
				});
			},
			pinned: 1,
			section: "Home Page",
		};
	};

	const actionSections = sectionedChoices(
		[
			...[
				clipboardAction(),
				customizeShortcuts(),
				customizeWidgetsAction(),
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
