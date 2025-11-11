import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from './theming';
import { searchActions, getShortcuts } from '@/lib/registry';
import { ActionRegistration } from '@/types';

type SearchPanelProps = {
  onClose: () => void;
};

export function SearchPanel({ onClose }: SearchPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ActionRegistration[]>([]);

  const bgColor = isDark ? '#1c1c1e' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtleTextColor = isDark ? '#8e8e93' : '#6e6e73';
  const inputBgColor = isDark ? '#2c2c2e' : '#f2f2f7';

  const shortcuts = getShortcuts();

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim()) {
      const searchResults = searchActions(text);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const handleActionPress = (action: ActionRegistration) => {
    Keyboard.dismiss();
    if (action.handler) {
      action.handler({});
    }
    onClose();
  };

  const handleBackdropPress = () => {
    Keyboard.dismiss();
    onClose();
  };

  const displayActions = query.trim() ? results : shortcuts;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.backdropBlur} />
      </TouchableOpacity>

      {/* Panel Content */}
      <View style={[styles.panel, { backgroundColor: bgColor }]}>
        {/* Search Header */}
        <View style={styles.header}>
          <View style={[styles.searchInput, { backgroundColor: inputBgColor }]}>
            <Ionicons name="search" size={20} color={subtleTextColor} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Search actions..."
              placeholderTextColor={subtleTextColor}
              value={query}
              onChangeText={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={subtleTextColor} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: '#007AFF' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <ScrollView
          style={styles.results}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!query.trim() && (
            <Text style={[styles.sectionTitle, { color: subtleTextColor }]}>
              Quick Actions
            </Text>
          )}
          {displayActions.length > 0 ? (
            displayActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.resultItem, { borderBottomColor: inputBgColor }]}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.7}
              >
                <View style={styles.resultContent}>
                  <View style={[styles.iconContainer, { backgroundColor: action.color || inputBgColor }]}>
                    <Ionicons name="flash-outline" size={20} color={textColor} />
                  </View>
                  <View style={styles.resultText}>
                    <Text style={[styles.resultTitle, { color: textColor }]}>
                      {action.label || 'Action'}
                    </Text>
                    {action.section && (
                      <Text style={[styles.resultSubtitle, { color: subtleTextColor }]}>
                        {action.section}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={subtleTextColor} />
              </TouchableOpacity>
            ))
          ) : query.trim() ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={subtleTextColor} />
              <Text style={[styles.emptyText, { color: subtleTextColor }]}>
                No actions found for "{query}"
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="apps-outline" size={48} color={subtleTextColor} />
              <Text style={[styles.emptyText, { color: subtleTextColor }]}>
                No quick actions configured
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropBlur: {
    flex: 1,
  },
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  cancelButton: {
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
