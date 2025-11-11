import React, { createContext, useContext, useEffect, useState } from "react";
import {
	Appearance,
	Platform,
	useColorScheme as useNativeColorScheme,
} from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
}

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	colorScheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
	children,
	defaultTheme = "system",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	const [colorScheme, setColorScheme] = useState<"light" | "dark">(
		Appearance.getColorScheme() || "light"
	);
	const systemColorScheme = useNativeColorScheme();

	// Update the color scheme when theme changes
	useEffect(() => {
		if (theme === "system") {
			// Use the system color scheme
			setColorScheme(systemColorScheme || "light");

			// Listen for system theme changes
			const subscription = Appearance.addChangeListener(
				({ colorScheme }) => {
					if (colorScheme) {
						setColorScheme(colorScheme);
					}
				}
			);

			return () => {
				subscription.remove();
			};
		} else {
			// Set the theme directly
			setColorScheme(theme);
		}
	}, [theme, systemColorScheme]);

	const value = {
		theme,
		setTheme,
		colorScheme,
	};

	// On the web, we need to manually add the dark class to the document
	useEffect(() => {
		if (Platform.OS === "web") {
			if (colorScheme === "dark") {
				// Add dark class to html element for web
				document.documentElement.classList.add("dark");
			} else {
				// Remove dark class
				document.documentElement.classList.remove("dark");
			}
		}
	}, [colorScheme]);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
