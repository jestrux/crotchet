import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { Action, Page } from '../../shared/models';

export default function PaletteScreen() {
  const { theme } = useTheme();

  // Example usage of shared models (placeholder data)
  const exampleActions: Action[] = [
    {
      id: 'search',
      name: 'search',
      label: 'Search',
      icon: '🔍',
      shortcut: 'Cmd+K'
    },
    {
      id: 'settings',
      name: 'settings', 
      label: 'Settings',
      icon: '⚙️',
    }
  ];

  const examplePage: Page = {
    id: 'palette',
    type: 'search',
    title: 'Command Palette',
    actions: exampleActions
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.canvas }]}>
      <Text style={[styles.title, { color: theme.content }]}>
        {examplePage.title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.content }]}>
        {exampleActions.length} actions available
      </Text>
      <Text style={[styles.subtitle, { color: theme.content }]}>
        Command palette interface coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});