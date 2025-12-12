import { useDataLoader } from "@/crotchet/hooks";
import { getRootActions } from "@/crotchet/rootActions";
import { getHomePagePreferences } from "@/crotchet/userPreferences";
import {
	camelCaseToSentenceCase,
	dispatch,
	getPreference,
	getUserPreferences,
	savePreference,
	sectionedChoices,
} from "@/crotchet/utils";
import { useState } from "react";

export const useMobileActions = () => {
	const [searchQuery, setSearchQuery] = useState();
	const { data: actions, refetch } = useDataLoader({
		// handler: window.globalActions,
		handler: getRootActions,
		listenForUpdates: "extensions-updated",
	});

	const actionChoices = (selected) =>
		_.map(
			[...window.globalActions(), ...window.internalActions()],
			(action) => ({
				..._.pick(action, ["icon", "label", "name"]),
				idx: selected?.indexOf(action.name),
				icon: action.icon || window.UI.icon("bolt"),
				label: action.label || camelCaseToSentenceCase(action.name),
				value: action.name,
				selected: Array.isArray(selected)
					? selected.includes(action.name)
					: selected == action.name,
			})
		);

	const { data: pinnedActions } = useDataLoader({
		handler: async () => {
			const { getPinnedActions, getAvailablePinnedActions } =
				await import("@/crotchet/userPreferences");

			const savedActions = await getPinnedActions();
			const availableActions = getAvailablePinnedActions();

			return savedActions
				.map((url) => {
					const pinnedAction = availableActions.find(
						(a) => a.value === url
					);
					if (!pinnedAction) return null;

					return {
						color: pinnedAction.color,
						colorDark: pinnedAction.colorDark,
						icon: pinnedAction.icon,
						label: pinnedAction.label,
						url: pinnedAction.value,
					};
				})
				.filter(Boolean);
		},
		listenForUpdates: "pinned-actions-updated",
	});

	const customizeHomePage = () => {
		return {
			icon: window.UI.svg(
				"m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
			),
			label: "Home Page",
			handler: async () => {
				const { wallpaper, headerAlignment, shortcutStyle } =
					await getHomePagePreferences();

				const savedShortcuts = await getPreference(
					"homePageShortcuts",
					["clipboard"]
				);

				const homePageContent = await getPreference(
					"homePageContent",
					[]
				);

				const widgetChoices = _.orderBy(
					_.keys(window.widgets).reduce((agg, item) => {
						const key = "widget~#~" + item;
						const widget = window.widgets[item] || {};

						agg.push({
							icon: widget.icon || window.UI.icon("card"),
							label:
								widget.label || camelCaseToSentenceCase(item),
							value: key,
							selected: homePageContent.includes(key),
							idx: homePageContent.indexOf(key),
						});

						return agg;
					}, []),
					["selected", "idx"],
					"desc"
				);

				window.openAlertForm({
					title: "Customize Home Page",
					fields: {
						header: {
							type: "preferences",
							fields: {
								wallpaper: {
									icon: window.UI.svg(
										"m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
									),
									label: "Wallpaper",
									type: "radio",
									choices: [
										{ label: "None", value: "none" },
										{ label: "Auto", value: "auto" },
									],
								},
								alignment: {
									icon: window.UI.svg(
										"M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
									),
									type: "radio",
									choices: [
										{ label: "Left", value: "left" },
										{ label: "Center", value: "center" },
									],
								},
								shortcutStyle: {
									icon: window.UI.svg(
										"M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
									),
									type: "radio",
									choices: [
										{ label: "Grid", value: "grid" },
										{ label: "Pill", value: "wrap" },
										{ label: "List", value: "inline" },
									],
								},
							},
						},
						shortcuts: {
							type: "radio",
							editable: true,
							choices: actionChoices(savedShortcuts),
						},
						widgets: {
							type: "radio",
							editable: true,
							choices: widgetChoices,
						},
					},
					data: {
						header: {
							wallpaper: !["auto", "none"].includes(wallpaper)
								? "Custom"
								: wallpaper,
							alignment: headerAlignment,
							shortcutStyle,
						},
						shortcuts: savedShortcuts,
						widgets: homePageContent,
					},
					onChange: async (values) => {
						if (!values) return;

						let wallpaperValue = values.header.wallpaper;
						if (wallpaperValue == "Custom")
							wallpaperValue = wallpaper;

						await Promise.all([
							await savePreference("homePagePreferences", {
								wallpaper: wallpaperValue,
								headerAlignment: values.header.alignment,
								shortcutStyle: values.header.shortcutStyle,
							}).then(() =>
								window.dispatch("home-page-preferences-updated")
							),
							await savePreference(
								"homePageShortcuts",
								values.shortcuts
							).then(() =>
								window.dispatch("home-page-shortcuts-updated")
							),
							await savePreference(
								"homePageContent",
								values.widgets
							).then(() =>
								window.dispatch("home-page-content-updated")
							),
						]);
					},
				});
			},
			pinned: 1,
			section: "Customize",
		};
	};

	const customizePinnedActions = () => {
		return {
			icon: window.UI.svg(
				"M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
			),
			label: "Pinned Actions",
			handler: async () => {
				const { getPinnedActions, getAvailablePinnedActions } =
					await import("@/crotchet/userPreferences");

				const savedActions = await getPinnedActions();
				const availableActions = getAvailablePinnedActions();

				window.openAlertForm({
					title: "Pinned Actions",
					fields: {
						actions: {
							type: "radio",
							label: "",
							hideLabel: true,
							editable: false,
							multiple: true,
							sortable: true,
							min: 5,
							choices: _.orderBy(
								availableActions.map((action) => ({
									label: action.label,
									value: action.value,
									icon: action.icon,
									selected: savedActions.includes(
										action.value
									),
									idx: savedActions.indexOf(action.value),
								})),
								["selected", "idx"],
								"desc"
							),
						},
					},
					data: {
						actions: savedActions,
					},
					onChange: async (res) => {
						const selectedActions = res?.actions;

						if (!selectedActions) return;

						const actionObjects = selectedActions
							.slice(0, 5)
							.map((url) => {
								const action = availableActions.find(
									(a) => a.value === url
								);
								return {
									icon: action.iosIcon,
									label: action.label,
									url: action.value,
								};
							});

						await savePreference("pinnedActions", selectedActions);

						await window.syncWidgetData(
							"pinnedActions",
							actionObjects
						);

						window.dispatch("pinned-actions-updated");
					},
				});
			},
			pinned: 1,
			section: "Customize",
		};
	};

	const manageTokens = () => {
		return {
			icon: window.UI.svg(
				"M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
			),
			label: "Manage Tokens",
			handler: async () => {
				const allPreferences = (await getUserPreferences()) ?? {};
				let tokens = Object.keys(allPreferences).reduce((agg, key) => {
					if (key.startsWith("token-"))
						agg[key.replace("token-", "")] = allPreferences[key];

					return agg;
				}, {});

				tokens = Object.keys(tokens);

				window.openAlertForm({
					inset: false,
					noHeading: false,
					title: "Manage Tokens",
					field: {
						hideLabel: true,
						type: "radio",
						editable: false,
						multiple: true,
						choices: tokens,
						value: tokens,
					},
					action: {
						label: "Save",
						successMessage: "Tokens updated",
						handler: async (newTokens) => {
							if (!newTokens) return true;

							const removedTokens = tokens.filter(
								(token) => !newTokens.includes(token)
							);

							for (const token of removedTokens) {
								// Removes preference
								await savePreference(`token-${token}`);
							}

							return true;
						},
					},
				});
			},
			pinned: 1,
			section: "Customize",
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
			section: "Customize",
			handler: async () => {
				const [
					behavior,
					[leftNavItem, centerNavItem, rightNavItem],
					appNavHoldAction,
				] = await Promise.all([
					await getPreference("appNavBehavior", "Regular"),
					await getPreference("appNavItems", [
						"Remote",
						"Search",
						"Profile",
					]),
					await getPreference("appNavHoldAction", "changeAppPage"),
				]);

				window.openAlertForm({
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
									choices: ["Regular", "Floating", "Hidden"],
								},
							},
						},
						appNavHoldAction: {
							hideLabel: true,
							type: "preferences",
							fields: {
								action: {
									label: "Long Press Home Action",
									type: "radio",
									choices: actionChoices(appNavHoldAction),
									meta: {
										inset: false,
									},
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
						appNavHoldAction: {
							action: appNavHoldAction,
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
							await savePreference(
								"appNavHoldAction",
								values.appNavHoldAction.action ||
									"changeAppPage"
							),
						]);

						dispatch("app-navigation-updated");
					},
				});
			},
		};
	};

	const actionSections = sectionedChoices(
		[
			...(searchQuery?.length ? pinnedActions || [] : []),
			...[
				customizeHomePage(),
				customizeNavigation(),
				...(window.onIos() ? [customizePinnedActions()] : []),
				manageTokens(),
			].filter(Boolean),
			...(actions || []),
		].map((a) => {
			if (searchQuery?.length) a.section = "Results";

			return a;
		}),
		searchQuery
	);

	return {
		searchQuery,
		setSearchQuery,
		actions,
		pinnedActions,
		actionSections,
		refetch,
	};
};
