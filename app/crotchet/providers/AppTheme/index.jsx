import { useDataLoader } from "@/crotchet/hooks";
import { dispatch, getPreference } from "@/crotchet/utils";
import { tinyColor } from "../color";

const getThemeProps = ({ colorScheme = "system", ...theme } = {}) => {
	const baseTheme =
		!colorScheme || colorScheme == "system"
			? {}
			: colorScheme == "dark"
			? {
					"--canvas-color": " 0 0 0",
					"--card-color": " 20 20 20",
					"--stroke-color": " 53 53 53",
					"--content-color": " 255 255 255",
					"--overlay-color": " rgba(0,0,0,0.2)",
			  }
			: {
					"--canvas-color": " 240 240 240",
					"--card-color": " 255 255 255",
					"--stroke-color": " 226 232 240",
					"--content-color": " 0 0 0",
					"--overlay-color": " rgba(0,0,0,0.035)",
			  };

	return {
		...baseTheme,
		colorScheme,
		...theme,
	};
};

export function useInitAppTheme() {
	useDataLoader({
		handler: async () => {
			const theme = await getPreference("crotchet-app-theme", {
				colorScheme: "system",
			});
			const themeProps = getThemeProps(theme);
			window["crotchet-app-theme"] = themeProps;
			dispatch("crotchet-app-theme-set");
		},
		listenForUpdates: "crotchet-app-theme-updated",
	});
}

export function useAppTheme() {
	const { data } = useDataLoader({
		handler: () => window["crotchet-app-theme"] || {},
		listenForUpdates: "crotchet-app-theme-set",
	});

	const setColors = (loading, crotchetApp) => {
		if (loading || !crotchetApp) return null;

		const primaryColor = tinyColor(crotchetApp.colors.primary);
		const primaryDarkColor = tinyColor(
			crotchetApp.colors.primaryDark || crotchetApp.colors.primary
		);
		const rgb = Object.values(primaryColor.toRgb()).slice(0, 3);
		const isLight = primaryColor.isLight();

		return (
			<style>
				{
					/*css*/ `
                        :root {
                            --primary-color: ${rgb.join(" ")};
                            --on-primary-color: ${
								isLight ? "0 0 0" : "255 255 255"
							};
                            --on-primary-inverted-color: ${
								isLight ? "255 255 255" : "0 0 0"
							};
                            --ion-color-primary: rgb(var(--primary-color));
                            --ion-color-primary-contrast: rgb(var(--on-primary-color));
                        }

                        body.dark {
                            --primary-color: ${Object.values(
								primaryDarkColor.toRgb()
							)
								.slice(0, 3)
								.join(" ")};
                            --on-primary-color: ${
								primaryDarkColor.isLight()
									? "0 0 0"
									: "255 255 255"
							};
                        }

                        @media (prefers-color-scheme: dark) {
                            :root {
                                --primary-color: ${Object.values(
									primaryDarkColor.toRgb()
								)
									.slice(0, 3)
									.join(" ")};
                                --on-primary-color: ${
									primaryDarkColor.isLight()
										? "0 0 0"
										: "255 255 255"
								};
                            }
                        }
                    `
				}
			</style>
		);
	};

	const variables = Object.entries(
		_.omit(window["crotchet-app-theme"] || {}, [
			"name",
			"colorScheme",
			"tintColor",
		])
	)
		.map(([key, value]) => `${key}: ${value}`)
		.join("; ");

	const ThemeStyles = () => (
		<style>
			{
				/*css*/ `
            :root {
                ${variables}
            }
        `
			}
		</style>
	);

	return { ...(data || {}), variables, ThemeStyles };
}
