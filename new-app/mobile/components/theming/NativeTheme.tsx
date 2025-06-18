import React from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from './ThemeProvider';

interface NativeThemeProps {
  children: React.ReactNode;
}

/**
 * NativeTheme applies the appropriate theme class ('dark' or 'light') to a wrapping View
 * This is needed for native platforms to properly apply CSS variables
 */
export function NativeTheme({ children }: NativeThemeProps) {
  const { colorScheme } = useTheme();
  
  // On native platforms, we need to use className with dark: prefix
  if (Platform.OS !== 'web') {
    return (
      <View 
        className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}
        style={{ flex: 1 }} // Ensure the view takes full space
      >
        {children}
      </View>
    );
  }
  
  // On web, we've already added the dark class to the document in ThemeProvider
  return <>{children}</>;
} 