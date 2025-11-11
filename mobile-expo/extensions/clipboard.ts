import { registerAction, registerWidget } from '@/lib/registry';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

// Register clipboard action
registerAction('clipboard', {
  label: 'Clipboard',
  icon: 'clipboard',
  color: '#FF6B6B',
  context: 'shortcut',
  handler: async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        Alert.alert('Clipboard', text);
      } else {
        Alert.alert('Clipboard', 'Clipboard is empty');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read clipboard');
    }
  },
});

// Register copy text action
registerAction('copy-text', {
  label: 'Copy Text',
  icon: 'copy',
  context: 'search',
  section: 'Clipboard',
  handler: async (payload) => {
    const text = payload?.text || 'Sample text copied!';
    await Clipboard.setStringAsync(text);
    Alert.alert('Success', 'Text copied to clipboard');
  },
});

// Register paste action
registerAction('paste', {
  label: 'Paste',
  icon: 'clipboard',
  context: 'search',
  section: 'Clipboard',
  handler: async () => {
    const text = await Clipboard.getStringAsync();
    Alert.alert('Pasted', text || 'Clipboard is empty');
  },
});
