import "../global.css";

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider, NativeTheme, useTheme } from '@/components/theming';
import { AppProvider } from '@/providers/AppProvider';
import { getThemeColors } from '@/components/screenOptions';

function ThemedRootStack() {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme as 'light' | 'dark');

  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.backgroundColor,
          },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
    </AppProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider defaultTheme="system">
      <NativeTheme>
        <ThemedRootStack />
      </NativeTheme>
    </ThemeProvider>
  );
}
