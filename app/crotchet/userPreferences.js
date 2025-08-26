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
