import { getPreference } from "./utils";

export const getHomePagePreferences = async () => {
	const defaultHomePagePreferences = {
		wallpaper: "none",
		headerAlignment: "left",
		shortcutStyle: "grid",
	};

	return {
		...defaultHomePagePreferences,
		...(await getPreference(
			"homePagePreferences",
			defaultHomePagePreferences
		)),
	};
};

export const getHomePageShortcuts = async () =>
	await getPreference("homePageShortcuts", ["clipboard"]);

export const getHomePageContent = async () =>
	await getPreference("homePageContent", []);

export const getAvailablePinnedActions = () => {
	const UI = window.UI;

	return [
		{
			iosIcon: "square.filled.on.square",
			icon: UI.svg(
				[
					"M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z",
					"M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708",
				],
				{ boxSize: 16, filled: true }
			),
			label: "Clipboard",
			value: "crotchet://action/clipboard",
			color: "#164e63",
			colorDark: "#7d959f",
			enabled: true,
		},
		{
			iosIcon: "pin.fill",
			icon: UI.svg(
				"M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146m.122 2.112v-.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a5 5 0 0 0-.288-.076 5 5 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a5 5 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034q.172.002.343-.04L9.927 2.028q-.042.172-.04.343a1.8 1.8 0 0 0 .062.46z",
				{ boxSize: 16, filled: true }
			),
			label: "Pinboard",
			value: "crotchet://search/pinnedItems",
			color: "#22C55E",
			enabled: true,
		},
		{
			iosIcon: "dot.radiowaves.left.and.right",
			icon: UI.svg(
				"M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
				{ strokeWidth: 1.8 }
			),
			label: "Now Playing",
			value: "crotchet://action/currentSongOnSpotify",
			color: "#5b21b6",
			colorDark: "#a56bff",
			enabled: false,
		},
		{
			iosIcon: "photo.on.rectangle.angled",
			icon: UI.svg(
				[
					"M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3",
					"M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z",
				],
				{ boxSize: 16, filled: true }
			),
			label: "Random Pic",
			value: "crotchet://action/randomUnsplashPic",
			color: "#3B82F6",
			enabled: false,
		},
		{
			iosIcon: "sparkles",
			icon: UI.icon("sparkles"),
			label: "Random Prompt",
			value: "crotchet://action/randomPrompt",
			color: "#d97706",
			colorDark: "#d19652",
			enabled: false,
		},
		{
			iosIcon: "qrcode",
			icon: UI.svg(
				[
					"M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z",
					"M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z",
				],
				{ filled: true }
			),
			label: "Text to QR",
			value: "crotchet://action/QrCodeGenerator",
			color: "#EF4444",
			enabled: false,
		},
	];
};

export const getPinnedActions = async () => {
	const defaultActions = [
		"crotchet://action/clipboard",
		"crotchet://search/pinnedItems",
		"crotchet://action/currentSongOnSpotify",
		"crotchet://action/randomUnsplashPic",
		"crotchet://action/randomPrompt",
	];

	// Migration: check for old key and migrate to new key
	const { getPreference: getRawPreference, savePreference } = await import("./utils");
	const oldKey = "nativeWidgetActions";
	const newKey = "pinnedActions";

	const existingNewValue = await getRawPreference(newKey, null);
	if (existingNewValue === null) {
		const oldValue = await getRawPreference(oldKey, null);
		if (oldValue !== null) {
			await savePreference(newKey, oldValue);
		}
	}

	return await getPreference(newKey, defaultActions);
};
