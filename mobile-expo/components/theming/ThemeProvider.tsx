import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, Platform, useColorScheme as useNativeColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: 'light' | 'dark';
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
    <ThemeContext.Provider value={{ theme, setTheme, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
