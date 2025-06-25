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
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-6"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
					/>
				</svg>
			),
			label: "Shortcuts",
			handler: async () => {
				const savedShortcuts = await getPreference(
					"homePageShortcuts",
					["clipboard"]
				);
				const allShortcuts = window.globalActions?.() ?? [];

				window.openAlertForm({
					title: "Customize Shortcuts",
					fields: {
						shortcutStyle: {
							type: "preferences",
							hideLabel: true,
							fields: {
								style: {
									type: "radio",
									label: "Shortcut Style",
									choices: ["grid", "wrap"],
								},
							},
						},
						shortcutItems: {
							type: "radio",
							label: "Shortcuts",
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
						shortcutItems: savedShortcuts,
						shortcutStyle: {
							style: await getPreference(
								"homePageShortcutStyle",
								["grid"]
							),
						},
					},
					onChange: async (values) =>
						Promise.all([
							await savePreference(
								"homePageShortcutStyle",
								values.shortcutStyle.style
							),
							await savePreference(
								"homePageShortcuts",
								values.shortcutItems
							),
						]).then(() =>
							window.dispatch("home-page-shortcuts-updated")
						),
				});
			},
			pinned: 1,
			section: "Quick Actions",
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
						d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z"
					/>
				</svg>
			),
			label: "Widgets",
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
					["selected", "idx"],
					"desc"
				);

				window.openChoicePicker({
					inset: false,
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
			section: "Quick Actions",
		};
	};

	const customizeNavigation = () => {
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
						d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
					/>
				</svg>
			),
			label: "Navbar",
			pinned: 1,
			section: "Quick Actions",
			handler: async () => {
				const [behavior, [leftNavItem, centerNavItem, rightNavItem]] =
					await Promise.all([
						await getPreference("appNavBehavior", ["Regular"]),
						await getPreference("appNavItems", [
							"Remote",
							"Search",
							"Profile",
						]),
					]);

				window.openAlertForm({
					dismissible: true,
					inset: false,
					title: "Customize App Navigation",
					sortable: true,
					multiple: true,
					fields: {
						navigationBehavior: {
							hideLabel: true,
							type: "preferences",
							fields: {
								behavior: {
									type: "radio",
									choices: ["Regular", "Floating"],
								},
							},
						},
						navigationItems: {
							hideLabel: true,
							type: "preferences",
							fields: {
								left: {
									label: "Left Nav Item",
									type: "radio",
									choices: ["Remote", "Pages", "Profile"],
								},
								center: {
									label: "Center Nav Item",
									type: "radio",
									choices: ["Search", "Home"],
								},
								right: {
									label: "Right Nav Item",
									type: "radio",
									choices: ["Remote", "Pages", "Profile"],
								},
							},
						},
					},
					data: {
						navigationBehavior: {
							behavior,
						},
						navigationItems: {
							left: leftNavItem,
							center: centerNavItem,
							right: rightNavItem,
						},
					},
					onChange: async (values) => {
						await Promise.all([
							await savePreference(
								"appNavBehavior",
								values.navigationBehavior.behavior || "Regular"
							),
							await savePreference("appNavItems", [
								values.navigationItems.left || "Remote",
								values.navigationItems.center || "Search",
								values.navigationItems.right || "Profile",
							]),
						]);

						dispatch("app-navigation-updated");
					},
				});
			},
		};
	};

	const actionSections = sectionedChoices(
		[
			...[
				// clipboardAction(),
				customizeShortcuts(),
				customizeWidgetsAction(),
				customizeNavigation(),
			],
			...(actions || []).reduce((agg, a) => {
				if (!a.context) {
					agg.push({
						...a,
						icon: null,
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
