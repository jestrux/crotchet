import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "./ThemeProvider";
import { getThemeColors } from "../screenOptions";

interface StackWithThemeProps {
	children?: React.ReactNode;
	screenOptions?: any;
	headerTitle?: string;
	headerLeft?: () => React.ReactNode;
	headerRight?: () => React.ReactNode;
}

/**
 * StackWithTheme provides a navigation Stack that adapts to the current theme
 * This ensures that navigation headers match our theme tokens
 */
export function StackWithTheme({
	children,
	screenOptions = {},
	headerTitle,
	headerLeft,
	headerRight,
}: StackWithThemeProps) {
	const { colorScheme } = useTheme();
	const colors = getThemeColors(colorScheme as "light" | "dark");

	return (
		<Stack
			screenOptions={{
				headerShadowVisible: false,
				headerStyle: {
					backgroundColor: colors.backgroundColor,
					...(screenOptions?.headerStyle || {}),
				},
				headerTintColor: colors.foregroundColor,
				contentStyle: {
					backgroundColor: colors.backgroundColor,
					...(screenOptions?.contentStyle || {}),
				},
				headerTitle,
				headerLeft,
				headerRight,
				...screenOptions,
			}}
		>
			{children}
		</Stack>
	);
}
