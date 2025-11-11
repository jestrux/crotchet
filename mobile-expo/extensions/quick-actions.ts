import { registerAction, registerWidget } from '@/lib/registry';
import { Alert, Linking } from 'react-native';
import * as Sharing from 'expo-sharing';

// Register search action
registerAction('search', {
  label: 'Search',
  icon: 'search',
  color: '#007AFF',
  context: 'shortcut',
  handler: async () => {
    Alert.alert('Search', 'Search functionality coming soon!');
  },
});

// Register camera action
registerAction('camera', {
  label: 'Camera',
  icon: 'camera',
  color: '#34C759',
  context: 'shortcut',
  handler: async () => {
    Alert.alert('Camera', 'Camera functionality coming soon!');
  },
});

// Register share action
registerAction('share', {
  label: 'Share',
  icon: 'share',
  context: 'search',
  section: 'Quick Actions',
  handler: async (payload) => {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      Alert.alert('Share', 'Share functionality ready!');
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  },
});

// Register open link action
registerAction('open-link', {
  label: 'Open Link',
  icon: 'open-external',
  context: 'search',
  section: 'Quick Actions',
  handler: async (payload) => {
    const url = payload?.url || 'https://example.com';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Cannot open this link');
    }
  },
});

// Register quick actions widget
registerWidget('quick-actions', {
  label: 'Quick Actions',
  title: 'Recent Activity',
  icon: 'flash',
  actions: [
    {
      label: 'Refresh',
      handler: () => {
        Alert.alert('Refresh', 'Refreshing recent activity...');
      },
    },
  ],
  resolve: async () => {
    return {
      recentItems: [
        { title: 'Opened Camera', time: '2 mins ago' },
        { title: 'Copied Text', time: '5 mins ago' },
        { title: 'Searched for "React"', time: '10 mins ago' },
      ],
    };
  },
});
