import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton } from '@/types';
import { useTheme } from './theming';

type ActionGridProps = {
  actions: (ActionButton & { icon?: string; color?: string })[];
  layout?: 'inline' | 'grid' | 'wrap';
  onActionPress?: (action: ActionButton) => void;
};

const iconMap: { [key: string]: any } = {
  clipboard: 'clipboard-outline',
  pinboard: 'pin-outline',
  search: 'search-outline',
  camera: 'camera-outline',
  share: 'share-outline',
  add: 'add-outline',
  edit: 'create-outline',
  delete: 'trash-outline',
  home: 'home-outline',
  play: 'play-outline',
  sparkles: 'sparkles-outline',
  bolt: 'flash-outline',
  check: 'checkmark-outline',
  close: 'close-outline',
};

export function ActionGrid({ actions, layout = 'grid', onActionPress }: ActionGridProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handlePress = (action: ActionButton) => {
    if (action.handler) {
      action.handler();
    } else if (onActionPress) {
      onActionPress(action);
    }
  };

  const getIconName = (icon?: string): any => {
    if (!icon) return 'apps-outline';
    return iconMap[icon] || 'apps-outline';
  };

  const renderAction = (action: ActionButton & { icon?: string; color?: string }, index: number) => {
    const bgColor = action.color || (isDark ? '#2c2c2e' : '#f2f2f7');
    const textColor = isDark ? '#ffffff' : '#000000';
    const iconColor = action.color || (isDark ? '#ffffff' : '#000000');

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.actionButton,
          layout === 'inline' && styles.actionButtonInline,
          { backgroundColor: bgColor },
        ]}
        onPress={() => handlePress(action)}
        activeOpacity={0.7}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name={getIconName(action.icon)} size={24} color={iconColor} />
        </View>
        {action.label && (
          <Text
            style={[
              styles.actionLabel,
              { color: textColor },
              layout === 'inline' && styles.actionLabelInline,
            ]}
            numberOfLines={layout === 'inline' ? 1 : 2}
          >
            {action.label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (layout === 'inline') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.inlineContainer}>
        <View style={styles.inlineContent}>
          {actions.map((action, index) => renderAction(action, index))}
        </View>
      </ScrollView>
    );
  }

  if (layout === 'wrap') {
    return (
      <View style={styles.wrapContainer}>
        {actions.map((action, index) => renderAction(action, index))}
      </View>
    );
  }

  // Default: grid layout
  return (
    <View style={styles.gridContainer}>
      {actions.map((action, index) => renderAction(action, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  inlineContainer: {
    flexDirection: 'row',
  },
  inlineContent: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 80,
  },
  actionButtonInline: {
    flexDirection: 'row',
    minWidth: 120,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionIconContainer: {
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionLabelInline: {
    marginLeft: 12,
    marginBottom: 0,
    fontSize: 14,
  },
});
