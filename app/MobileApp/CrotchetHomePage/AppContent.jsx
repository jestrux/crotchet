import { useAppContext } from "@/crotchet/providers/AppProvider";
import { useDataLoader, useLongPress } from "@/crotchet/hooks";
import { Widget } from "@/crotchet/components";
import MobileNav from "./Nav";
import Page from "./Page";
import PageSection from "@/crotchet/providers/AppScaffold/Page/PageSection";
import { BottomNavPlaceholder } from "@/crotchet/providers/AppScaffold/Page/PageNav";
import RemoteController from "@/crotchet/providers/Remote/RemoteController";
import { useMobileActions } from "./useMobileActions";
import ActionGrid from "@/crotchet/components/ActionGrid";
import { getPreference, randomId, savePreference } from "@/crotchet/utils";
import { useState } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { getHomePagePreferences } from "@/crotchet/userPreferences";

const HomePage = () => {
	const [shortcutsKey, setShortcutsKey] = useState(randomId());
	const { data: homePage } = useDataLoader({
		handler: getHomePagePreferences,
		listenForUpdates: ["home-page-preferences-updated"],
	});

	const { data: shortcuts } = useDataLoader({
		handler: async () => {
			const shortcuts = await getPreference("homePageShortcuts", [
				"clipboard",
			]);

			const shortcutStyle = await getPreference(
				"homePageShortcutStyle",
				"grid"
			);

			if (!shortcuts.length || !window.globalActions) return [];

			const mappedShortctuts = shortcuts
				.reduce((agg, name) => {
					const action = window.actions[name];
					if (action) {
						// eslint-disable-next-line no-unused-vars
						const { color, ...actionWithoutColor } = action;
						agg.push(
							shortcutStyle == "grid"
								? actionWithoutColor
								: action
						);
					}
					return agg;
				}, [])
				.filter((a) => a);

			setShortcutsKey(randomId());

			return { list: mappedShortctuts, style: shortcutStyle };
		},
		listenForUpdates: [
			"app-actions-updated",
			"home-page-shortcuts-updated",
		],
	});

	const { data: homePageContent } = useDataLoader({
		handler: async () => {
			const content = await getPreference("homePageContent", []);

			return content
				.map((nameWithType) => {
					let content;
					const [type, name] = nameWithType.split("~#~");

					if (type == "widget")
						content =
							(window.widgets && window.widgets[name]) ?? null;
					else if (type == "section")
						content =
							(window.sections && window.sections[name]) ?? null;

					return {
						type,
						name: nameWithType,
						content,
					};
				})
				.filter((i) => i.content);
		},
		listenForUpdates: [
			"sections-updated",
			"widgets-updated",
			"home-page-content-updated",
		],
	});

	const { actionSections } = useMobileActions();
	const headerAlignment = homePage?.headerAlignment;
	const wallpaper = homePage?.wallpaper ?? "none";
	const showWallpaper = wallpaper !== "none";
	const customWallpaper = ["auto", "none"].includes(wallpaper)
		? null
		: wallpaper;
	const shortcutStyle = homePage?.shortcutStyle;
	const lightModeWallpaper = customWallpaper
		? customWallpaper
		: "https://images.unsplash.com/photo-1624847706671-a7bf2f92ede0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fGxpZ2h0JTIwbW9kZSUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D";
	const darkModeWallpaper = customWallpaper
		? customWallpaper
		: "https://images.unsplash.com/photo-1622482607282-fffed5a93942?q=80&w=985&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

	const wallpaperGestures = useLongPress(() => {
		Haptics.impact({ style: ImpactStyle.Medium });
		const inDarkMode =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;

		const saveWallpaper = async (wallpaper) => {
			const prefs = await getHomePagePreferences();
			savePreference("homePagePreferences", {
				...prefs,
				wallpaper,
			}).then(() => window.dispatch("home-page-preferences-updated"));
		};

		const previewWallpaper = (value) => {
			window.openActionSheet({
				fullScreen: true,
				preview: {
					image: value,
				},
				actions: [
					{
						icon: window.UI.icon("check"),
						label: "Save Wallpaper",
						handler: () => saveWallpaper(value),
					},
				],
			});
		};

		const actions = [
			{
				icon: window.UI.icon("search"),
				label: "Search Wallpapers",
				handler: () => {
					window
						.openPage({
							source: "unsplash",
							title: "Select Wallpaper",
							placeholder: "Search wallpapers...",
							selectable: true,
						})
						.then((res) => {
							if (!res?.image) return;
							previewWallpaper(res.image);
						});
				},
			},
			{
				icon: window.UI.icon("copy"),
				label: "Paste Wallpaper",
				handler: async () => {
					const res = await window.readClipboard();

					if (!res || !res.value || !window.isValidUrl(res.value))
						return window.showActionSheetAlert(
							"Clipboard doesn't contain a valid url",
							res.value
						);

					previewWallpaper(res.value);
				},
			},
			{
				icon: window.UI.icon("restore"),
				label: "Reset Wallpaper",
				handler: () => saveWallpaper("auto"),
			},
			{
				icon: window.UI.icon("close"),
				label: "Remove Wallpaper",
				handler: () => saveWallpaper("none"),
				destructive: true,
			},
		];

		window.openActionSheet({
			fullScreen: true,
			preview: {
				image: inDarkMode ? darkModeWallpaper : lightModeWallpaper,
				actions,
			},
			actions,
		});
	});

	return (
		<div className="flex gap-5 p-6 lg:p-8 fixed inset-0 overflow-auto overscroll-none">
			<div className="hidden lg:block sticky top-0 h-full w-1/3 max-w-[400px] bg-yellow-500 dark:bg-card shadow rounded-2xl overflow-hidden">
				<div className="h-full flex flex-col relative overflow-hidden">
					<div className="mt-5 w-full px-4 ml-0.5">
						<h2 className="text-3xl font-bold">Hey Walter,</h2>
						<p>Here's how things are looking</p>
					</div>

					<div className="mt-4 mx-3 flex-1 space-y-4 overflow-auto">
						{shortcuts && (
							<ActionGrid
								key={shortcutsKey}
								title="Shorcuts"
								smallTitle
								data={shortcuts}
								type="inline"
								fallbackIcon={
									<svg
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
										/>
									</svg>
								}
							/>
						)}

						{actionSections.map(([section, actions], index) => {
							return (
								<ActionGrid
									key={"section" + index}
									title={section}
									smallTitle
									data={actions}
									type="inline"
									fallbackIcon={
										<svg
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
											/>
										</svg>
									}
								/>
							);
						})}
					</div>

					<div className="contents">
						<RemoteController flat />
					</div>
				</div>
			</div>

			<div className="flex-1 pt-6">
				{showWallpaper && (
					<div
						className="-mx-6 lg:-mx-8 relative"
						{...wallpaperGestures}
					>
						<div
							style={{
								height: "100px",
							}}
						/>

						<div
							className="absolute inset-x-0 -top-32 -bottom-56"
							// className="fixed inset-x-0 -top-20"
							style={{
								// height: "462px",
								mask: `linear-gradient(black, black, transparent)`,
							}}
						>
							<img
								className="object-cover pointer-events-none w-full h-full dark:hidden"
								src={lightModeWallpaper}
								alt=""
							/>
							<img
								className="object-cover pointer-events-none w-full h-full hidden dark:block"
								src={darkModeWallpaper}
								alt=""
							/>
						</div>
					</div>
				)}

				<div
					className="sticky -mx-6 -top-6 z-[999] backdrop-blur-[3px]"
					style={{
						height: "env(safe-area-inset-top)",
						mask: `linear-gradient(black, black, transparent)`,
					}}
				></div>

				<div className="relative lg:hidden mb-6">
					<div
						className="mb-5"
						style={{
							textAlign: headerAlignment,
							marginTop: "-env(safe-area-inset-top)",
						}}
					>
						<h2 className="text-3xl font-bold">Hey Walter,</h2>
						<p>Here's how things are looking</p>
					</div>

					{shortcuts && (
						<PageSection
							key={shortcutsKey}
							type="actions"
							data={shortcuts.list}
							meta={{
								alignment: headerAlignment,
								style: shortcutStyle,
								disableIconColor: shortcutStyle != "wrap",
								fallbackIcon: (
									<svg
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
										/>
									</svg>
								),
							}}
						/>
					)}
				</div>

				<div className="grid gap-6 max-w-xl mx-auto">
					{homePageContent?.map((entry, index) =>
						entry.type == "section" ? (
							<PageSection
								key={entry.name + index}
								{...entry.content}
							/>
						) : (
							<Widget
								key={entry.name + index}
								{...entry.content}
							/>
						)
					)}

					<BottomNavPlaceholder />
				</div>
			</div>
		</div>
	);
};

export default function AppContent() {
	const { pages, popPage } = useAppContext();

	return (
		<>
			<HomePage />

			{pages.map((page) => (
				<Page
					key={page.id}
					isOpen={page.id == pages.at(-1).id}
					page={page}
					onClose={(data) => popPage(page.id, data)}
				>
					{page.content}
				</Page>
			))}

			<div className="lg:hidden">
				<MobileNav />
			</div>
		</>
	);
}
