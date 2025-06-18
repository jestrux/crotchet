import React from "react";
import { useTheme } from "./ThemeProvider";
import { getThemeColors } from "../screenOptions";

export default function Theme({
	children,
}: {
	children:
		| React.ReactNode
		| ((props: {
				colors: ReturnType<typeof getThemeColors>;
				colorScheme: "light" | "dark";
		  }) => React.ReactNode);
}) {
	const { colorScheme } = useTheme();
	const colors = getThemeColors(colorScheme);

	return (
		<>
			{typeof children === "function"
				? children({
						colors,
						colorScheme,
				  })
				: children}
		</>
	);
}
