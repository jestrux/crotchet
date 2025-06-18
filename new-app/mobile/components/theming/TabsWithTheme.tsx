import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "./ThemeProvider";
import { getThemeColors } from "../screenOptions";

interface TabsWithThemeProps {
	children: React.ReactNode;
	headerTitle?: string;
	headerLeft?: () => React.ReactNode;
	headerRight?: () => React.ReactNode;
}

export function TabsWithTheme({
	children,
	headerTitle,
	headerLeft,
	headerRight,
}: TabsWithThemeProps) {
	const { colorScheme } = useTheme();
	const colors = getThemeColors(colorScheme as "light" | "dark");
	const borderColor =
		colorScheme === "dark"
			? "rgba(255, 255, 255, 0.1)"
			: "rgba(0, 0, 0, 0.1)";

	return (
		<Tabs
			screenOptions={{
				headerStyle: {
					backgroundColor: colors.backgroundColor,
					borderBottomColor: borderColor,
				},
				headerTitleStyle: {
					fontWeight: "bold",
					color: colors.foregroundColor,
				},
				tabBarStyle: {
					backgroundColor: colors.backgroundColor,
					borderTopColor: borderColor,
				},
				tabBarActiveTintColor: colors.primaryColor,
				tabBarInactiveTintColor: colors.mutedForegroundColor,
				headerTitle: headerTitle,
				headerLeft: headerLeft,
				headerRight: headerRight,
			}}
		>
			{children}
		</Tabs>
	);
}
