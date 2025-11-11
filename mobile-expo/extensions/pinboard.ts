import { registerAction, registerWidget } from '@/lib/registry';
import { Alert } from 'react-native';

// Sample pinned items (static data)
const pinnedItems = [
  {
    title: 'Important Note',
    subtitle: 'Remember to review the project timeline',
    icon: 'bookmark',
  },
  {
    title: 'Meeting Link',
    subtitle: 'zoom.us/j/1234567890',
    icon: 'link',
  },
  {
    title: 'Quick Reminder',
    subtitle: 'Buy groceries on the way home',
    icon: 'time',
  },
];

// Register pinboard action
registerAction('pinboard', {
  label: 'Pinboard',
  icon: 'pinboard',
  color: '#4ECDC4',
  context: 'shortcut',
  handler: async () => {
    const items = pinnedItems.map((item) => item.title).join('\n');
    Alert.alert('Pinned Items', items);
  },
});

// Register add to pinboard action
registerAction('add-to-pinboard', {
  label: 'Add to Pinboard',
  icon: 'add',
  context: 'search',
  section: 'Pinboard',
  handler: async (payload) => {
    Alert.alert('Success', 'Item added to pinboard');
  },
});

// Register pinboard widget
registerWidget('pinboard-widget', {
  label: 'Pinboard',
  title: 'Pinned Items',
  icon: 'pin',
  actions: [
    {
      label: 'View All',
      handler: () => {
        Alert.alert('Pinboard', 'Opening all pinned items...');
      },
    },
  ],
  resolve: async () => {
    return pinnedItems;
  },
});
