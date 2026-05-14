import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, Platform, useColorScheme as useNativeColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

export type ThemeColors = {
  panelBg: string;
  backdropBg: string;
  icon: string;
  iconStrong: string;
  iconMuted: string;
  iconFaint: string;
  iconSubtle: string;
  iconGhost: string;
  placeholder: string;
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: 'light' | 'dark';
  colors: ThemeColors;
}

function buildColors(isDark: boolean): ThemeColors {
  return {
    panelBg: isDark ? 'rgba(20,20,20,0.97)' : 'rgba(245,245,244,0.97)',
    backdropBg: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)',
    icon: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    iconStrong: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
    iconMuted: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)',
    iconFaint: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)',
    iconSubtle: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
    iconGhost: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    placeholder: isDark ? '#737373' : '#a3a3a3',
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() ?? 'light'
  );
  const systemColorScheme = useNativeColorScheme();
  const colors = buildColors(colorScheme === 'dark');

  useEffect(() => {
    if (theme === 'system') {
      setColorScheme(systemColorScheme ?? 'light');
      const subscription = Appearance.addChangeListener(({ colorScheme: c }) => {
        if (c) setColorScheme(c);
      });
      return () => subscription.remove();
    } else {
      setColorScheme(theme);
    }
  }, [theme, systemColorScheme]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.classList.toggle('dark', colorScheme === 'dark');
    }
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colorScheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

const DEFAULT_THEME_CTX: ThemeContextType = {
  theme: 'system',
  setTheme: () => {},
  colorScheme: Appearance.getColorScheme() ?? 'light',
  colors: buildColors(Appearance.getColorScheme() === 'dark'),
};

export function useTheme() {
  return useContext(ThemeContext) ?? DEFAULT_THEME_CTX;
}
