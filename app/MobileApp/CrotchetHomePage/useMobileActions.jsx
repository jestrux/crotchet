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

	const pinnedActions = [
		{
			color: "#164e63",
			colorDark: "#7d959f",
			icon: (
				<svg fill="currentColor" viewBox="0 0 16 16">
					<path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
					<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
					<path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
				</svg>
			),
			label: "Clipboard",
			url: `/modal`,
		},
		{
			color: "#22C55E",
			icon: (
				<svg fill="currentColor" viewBox="0 0 16 16">
					<path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146" />
				</svg>
			),
			label: "Pinboard",
			handler: async () =>
				window.openPage({
					title: "Pinboard",
					source: "pinnedItems",
				}),
		},
		{
			color: "#5b21b6",
			colorDark: "#a56bff",
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
					/>
				</svg>
			),
			label: "Remote",
			url: `/modal`,
		},
		{
			color: "#d97706",
			colorDark: "#d19652",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
					/>
				</svg>
			),
			label: "Collections",
			url: `/modal`,
		},
		{
			color: "#3B82F6",
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
					/>
				</svg>
			),
			label: "Pages",
			url: `/modal`,
		},
		{
			color: "#EF4444",
			icon: (
				<svg fill="currentColor" viewBox="0 0 16 16">
					<path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h1A1.5 1.5 0 0 1 5 2.5h4.134a1 1 0 1 1 0 1h-2.01q.269.27.484.605C8.246 5.097 8.5 6.459 8.5 8c0 1.993.257 3.092.713 3.7.356.476.895.721 1.787.784A1.5 1.5 0 0 1 12.5 11h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5H6.866a1 1 0 1 1 0-1h1.711a3 3 0 0 1-.165-.2C7.743 11.407 7.5 10.007 7.5 8c0-1.46-.246-2.597-.733-3.355-.39-.605-.952-1-1.767-1.112A1.5 1.5 0 0 1 3.5 5h-1A1.5 1.5 0 0 1 1 3.5zM2.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm10 10a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
				</svg>
			),
			label: "Automations",
			url: `/modal`,
		},
	];

	const customizeHomePage = () => {
		return {
			icon: window.UI.svg(
				"m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
			),
			label: "Home Page",
			handler: async () => {
				const defaultPreferences = {
					wallpaper: "none",
					headerAlignment: "left",
					shortcutStyle: "grid",
				};

				const { wallpaper, headerAlignment, shortcutStyle } = {
					...defaultPreferences,
					...(await getPreference(
						"homePagePreferences",
						defaultPreferences
					)),
				};

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

				console.log(
					"Home page content: ",
					savedShortcuts,
					homePageContent
					// widgetChoices
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
							wallpaper,
							alignment: headerAlignment,
							shortcutStyle,
						},
						shortcuts: savedShortcuts,
						widgets: homePageContent,
					},
					onChange: async (values) => {
						if (!values) return;

						await Promise.all([
							await savePreference("homePagePreferences", {
								wallpaper: values.header.wallpaper,
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
			...(searchQuery?.length ? pinnedActions : []),
			...[customizeHomePage(), customizeNavigation()],
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
