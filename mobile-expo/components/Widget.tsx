import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, WidgetPayload } from '@/types';
import { useTheme } from './theming';

type WidgetProps = {
  title?: string;
  actions?: ActionButton[];
  content?: any;
  loading?: boolean;
  data?: any;
  onActionPress?: (action: ActionButton) => void;
  aspectRatio?: string;
};

const { width } = Dimensions.get('window');

export function Widget({
  title,
  actions = [],
  content,
  loading = false,
  data,
  onActionPress,
  aspectRatio = '16/9',
}: WidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);

  const bgColor = isDark ? '#1c1c1e' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtleTextColor = isDark ? '#8e8e93' : '#6e6e73';

  const handleActionPress = (action: ActionButton) => {
    if (action.handler) {
      action.handler({ loading, data });
    } else if (onActionPress) {
      onActionPress(action);
    }
  };

  // Calculate aspect ratio height
  const [ratioWidth, ratioHeight] = aspectRatio.split('/').map(Number);
  const cardHeight = ((width - 48) * ratioHeight) / ratioWidth;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, height: cardHeight }]}>
      {/* Header */}
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        </View>
      )}

      {/* Content Area */}
      <View style={styles.contentArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: subtleTextColor }]}>Loading...</Text>
          </View>
        ) : content ? (
          <View style={styles.customContent}>{content}</View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="apps-outline" size={48} color={subtleTextColor} />
            <Text style={[styles.placeholderText, { color: subtleTextColor }]}>Widget Content</Text>
          </View>
        )}
      </View>

      {/* Actions Overlay */}
      {actions.length > 0 && (
        <View style={styles.actionsOverlay}>
          <View style={[styles.actionsContainer, { backgroundColor: bgColor + 'cc' }]}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionLabel, { color: textColor }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  customContent: {
    flex: 1,
    width: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  actionsContainer: {
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
