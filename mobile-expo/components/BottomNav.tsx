import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from './theming';
import { SearchPanel } from './SearchPanel';

type NavItem = {
  icon: string;
  label: string;
  onPress: () => void;
};

type BottomNavProps = {
  leftAction?: NavItem;
  centerAction?: NavItem;
  rightAction?: NavItem;
  onSearchOpen?: () => void;
};

const { height } = Dimensions.get('window');

export function BottomNav({
  leftAction,
  centerAction,
  rightAction,
  onSearchOpen,
}: BottomNavProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchVisible, setSearchVisible] = useState(false);
  const searchHeight = useSharedValue(0);

  const bgColor = isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const iconColor = isDark ? '#ffffff' : '#000000';

  const handleCenterPress = () => {
    if (centerAction?.onPress) {
      centerAction.onPress();
    } else {
      // Default: open search
      setSearchVisible(true);
      searchHeight.value = withSpring(height * 0.8, {
        damping: 20,
        stiffness: 90,
      });
      onSearchOpen?.();
    }
  };

  const handleCloseSearch = () => {
    searchHeight.value = withTiming(0, { duration: 250 });
    setTimeout(() => setSearchVisible(false), 250);
  };

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: searchHeight.value,
    };
  });

  const NavButton = ({ item, position }: { item?: NavItem; position: 'left' | 'center' | 'right' }) => {
    if (!item && position !== 'center') return <View style={styles.navButton} />;

    const iconName = item?.icon || 'search-outline';
    const isCenter = position === 'center';

    return (
      <TouchableOpacity
        style={[styles.navButton, isCenter && styles.centerButton]}
        onPress={
          position === 'center'
            ? handleCenterPress
            : item?.onPress
        }
        activeOpacity={0.7}
      >
        <Ionicons
          name={iconName as any}
          size={isCenter ? 28 : 24}
          color={iconColor}
        />
        {item?.label && !isCenter && (
          <Text style={[styles.navLabel, { color: iconColor }]}>
            {item.label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Search Panel */}
      {searchVisible && (
        <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
          <SearchPanel onClose={handleCloseSearch} />
        </Animated.View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.navContent, { backgroundColor: bgColor }]}
        >
          <View style={styles.navItems}>
            <NavButton item={leftAction} position="left" />
            <NavButton item={centerAction} position="center" />
            <NavButton item={rightAction} position="right" />
          </View>
        </BlurView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  navContent: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  navItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingVertical: 8,
  },
  centerButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  searchContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
});
