import React from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from './ThemeProvider';

export function NativeTheme({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useTheme();

  if (Platform.OS !== 'web') {
    return (
      <View className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`} style={{ flex: 1 }}>
        {children}
      </View>
    );
  }

  return <>{children}</>;
}
