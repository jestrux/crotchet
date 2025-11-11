import React from 'react';
import { TouchableOpacity, View, Text, Platform } from 'react-native';
import { useTheme } from './ThemeProvider';

export function ThemeSwitcher() {
  const { theme, setTheme, colorScheme } = useTheme();

  return (
    <View className="space-y-4">
      <View className="flex flex-row flex-wrap items-center gap-2">
        <Text className="text-foreground font-medium">Theme Mode:</Text>
        <View className="flex flex-row space-x-2">
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-md ${theme === 'light' ? 'bg-primary' : 'bg-muted'}`}
            onPress={() => setTheme('light')}
          >
            <Text className={theme === 'light' ? 'text-primary-foreground' : 'text-foreground'}>Light</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-3 py-1.5 rounded-md ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
            onPress={() => setTheme('dark')}
          >
            <Text className={theme === 'dark' ? 'text-primary-foreground' : 'text-foreground'}>Dark</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-3 py-1.5 rounded-md ${theme === 'system' ? 'bg-primary' : 'bg-muted'}`}
            onPress={() => setTheme('system')}
          >
            <Text className={theme === 'system' ? 'text-primary-foreground' : 'text-foreground'}>System</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex flex-row items-center space-x-2">
        <Text className="text-foreground font-medium">Status:</Text>
        <View className="bg-muted px-3 py-1.5 rounded-md">
          <Text className="text-muted-foreground">
            Setting: {theme}, Active: {colorScheme || 'unknown'}, Platform: {Platform.OS}
          </Text>
        </View>
      </View>
    </View>
  );
}
