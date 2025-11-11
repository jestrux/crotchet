/**
 * Gets color values for theming navigation components
 * This ensures consistent theming in navigation headers
 */
export function getThemeColors(colorScheme: "light" | "dark") {
	const backgroundColor =
		colorScheme === "dark" ? "rgb(9, 9, 11)" : "rgb(255, 255, 255)";
	const cardColor =
		colorScheme === "dark" ? "rgb(18, 18, 23)" : "rgb(255, 255, 255)";
	const foregroundColor =
		colorScheme === "dark" ? "rgb(250, 250, 250)" : "rgb(9, 9, 11)";
	const primaryColor = colorScheme === "dark" ? "#395C9C" : "#0E3472";
	const mutedForegroundColor = colorScheme === "dark" ? "#555555" : "#717171";
	const borderColor =
		colorScheme === "dark"
			? "rgba(255, 255, 255, 0.1)"
			: "rgba(0, 0, 0, 0.1)";
	return {
		backgroundColor,
		cardColor,
		foregroundColor,
		primaryColor,
		mutedForegroundColor,
		borderColor,
	};
}
