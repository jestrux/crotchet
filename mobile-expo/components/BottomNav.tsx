import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Keyboard,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList) as typeof SectionList;
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, NativeViewGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theming';

const NAV_HEIGHT = 64;
const PILL_HEIGHT = 42;
const TIMING = { duration: 280, easing: Easing.out(Easing.cubic) };

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const QUICK_ACTIONS = [
  { id: 'clipboard', label: 'Clipboard', icon: 'clipboard-outline' as const, color: '#164e63', colorDark: '#7d959f' },
  { id: 'pinboard', label: 'Pinboard', icon: 'pin-outline' as const, color: '#22C55E' },
  { id: 'now-playing', label: 'Now Playing', icon: 'musical-notes-outline' as const, color: '#5b21b6', colorDark: '#a56bff' },
  { id: 'random-pic', label: 'Random Pic', icon: 'image-outline' as const, color: '#3B82F6' },
  { id: 'random-prompt', label: 'Random Prompt', icon: 'color-wand-outline' as const, color: '#d97706', colorDark: '#d19652' },
];

type ActionItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const ACTION_SECTIONS: { title: string; data: ActionItem[] }[] = [
  {
    title: 'Customize',
    data: [
      { id: 'home-page', label: 'Home Page', icon: 'home-outline' },
      { id: 'pinned-actions', label: 'Pinned Actions', icon: 'star-outline' },
      { id: 'navbar', label: 'Navbar', icon: 'menu-outline' },
      { id: 'manage-tokens', label: 'Manage Tokens', icon: 'key-outline' },
    ],
  },
  {
    title: 'Actions',
    data: [
      { id: 'open-app', label: 'Open App', icon: 'apps-outline' },
      { id: 'search-web', label: 'Search Web', icon: 'globe-outline' },
      { id: 'open-link', label: 'Open Link', icon: 'link-outline' },
      { id: 'add-note', label: 'Add Note', icon: 'create-outline' },
      { id: 'share', label: 'Share', icon: 'share-outline' },
      { id: 'copy', label: 'Copy', icon: 'copy-outline' },
      { id: 'open-camera', label: 'Open Camera', icon: 'camera-outline' },
      { id: 'set-timer', label: 'Set Timer', icon: 'timer-outline' },
      { id: 'translate', label: 'Translate', icon: 'language-outline' },
      { id: 'text-to-qr', label: 'Text to QR', icon: 'qr-code-outline' },
    ],
  },
  {
    title: 'Data Sources',
    data: [
      { id: 'youtube', label: 'YouTube', icon: 'logo-youtube' },
      { id: 'pinboard-source', label: 'Pinboard', icon: 'pin-outline' },
      { id: 'notes', label: 'Notes', icon: 'document-text-outline' },
      { id: 'photos', label: 'Photos', icon: 'images-outline' },
      { id: 'podcasts', label: 'Podcasts', icon: 'mic-outline' },
      { id: 'github', label: 'GitHub', icon: 'logo-github' },
      { id: 'readwise', label: 'Readwise', icon: 'book-outline' },
    ],
  },
];

function KeyboardPlaceholder() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return <View style={{ height }} />;
}

export function BottomNav() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const isDark = colorScheme === 'dark';
  const safeBottom = insets.bottom * 0.6;
  const INSET_BOTTOM = NAV_HEIGHT + safeBottom;
  const COLLAPSED_Y = screenHeight - INSET_BOTTOM;
  const EXPANDED_Y = screenHeight * 0.35;

  const translateY = useSharedValue(COLLAPSED_Y);
  const isExpandedSV = useSharedValue(false);
  const isExpandedOpacity = useSharedValue(0);
  const defaultContentOpacity = useSharedValue(1);

  const listGestureRef = useRef(null);

  const sectionsData = useMemo(() => {
    if (!searchQuery.length) return ACTION_SECTIONS;
    const allItems = ACTION_SECTIONS.flatMap((s) => s.data);
    const filtered = allItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.length > 0 ? [{ title: 'Results', data: filtered }] : [];
  }, [searchQuery]);

  const expand = useCallback(() => {
    translateY.value = withTiming(EXPANDED_Y, TIMING);
    isExpandedSV.value = true;
    isExpandedOpacity.value = withTiming(1, { duration: 150 });
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [EXPANDED_Y, isExpandedOpacity, isExpandedSV, translateY]);

  const collapse = useCallback(() => {
    translateY.value = withTiming(COLLAPSED_Y, TIMING);
    isExpandedSV.value = false;
    isExpandedOpacity.value = withTiming(0, { duration: 150 });
    defaultContentOpacity.value = 1;
    setExpanded(false);
    inputRef.current?.blur();
    setSearchQuery('');
  }, [COLLAPSED_Y, defaultContentOpacity, isExpandedOpacity, isExpandedSV, translateY]);

  const refocusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // Tracks list scroll offset on the UI thread so the list pan gesture can check it
  const listScrollOffset = useSharedValue(0);
  const setIsAtTopJS = useCallback((val: boolean) => setIsAtTop(val), []);

  const listScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const atTop = y <= 0;
      if (atTop !== (listScrollOffset.value <= 0)) {
        runOnJS(setIsAtTopJS)(atTop);
      }
      listScrollOffset.value = y;
    },
  });

  // Pan gesture on the list — simultaneous with scroll, activates only when at the
  // top of the list and dragging down, driving the panel instead of rubber-banding.
  const listPanGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(listGestureRef)
    .onUpdate((e) => {
      if (!isExpandedSV.value || listScrollOffset.value > 2 || e.translationY <= 0) return;
      translateY.value = Math.min(COLLAPSED_Y, EXPANDED_Y + e.translationY);
    })
    .onEnd((e) => {
      if (!isExpandedSV.value || listScrollOffset.value > 2 || e.translationY <= 0) return;
      const progress = (COLLAPSED_Y - translateY.value) / (COLLAPSED_Y - EXPANDED_Y);
      if (progress < 0.9) {
        runOnJS(collapse)();
      } else {
        translateY.value = withTiming(EXPANDED_Y, TIMING);
        runOnJS(refocusInput)();
      }
    });

  const panGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(listGestureRef)
    .onUpdate((e) => {
      // When expanded, only allow downward drag (collapsing direction).
      // Upward drag belongs to the scroll list — return so we don't consume the touch.
      if (isExpandedSV.value && e.translationY <= 0) return;

      const base = isExpandedSV.value ? EXPANDED_Y : COLLAPSED_Y;
      translateY.value = Math.max(EXPANDED_Y, Math.min(COLLAPSED_Y, base + e.translationY));
    })
    .onEnd(() => {
      const progress = (COLLAPSED_Y - translateY.value) / (COLLAPSED_Y - EXPANDED_Y);
      if (isExpandedSV.value) {
        if (progress >= 0.9) {
          translateY.value = withTiming(EXPANDED_Y, TIMING);
          runOnJS(refocusInput)();
        } else {
          runOnJS(collapse)();
        }
      } else {
        if (progress <= 0.1) {
          translateY.value = withTiming(COLLAPSED_Y, TIMING);
        } else {
          runOnJS(expand)();
        }
      }
    });

  const panelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderTopLeftRadius: interpolate(translateY.value, [EXPANDED_Y, COLLAPSED_Y], [32, 0], Extrapolation.CLAMP),
    borderTopRightRadius: interpolate(translateY.value, [EXPANDED_Y, COLLAPSED_Y], [32, 0], Extrapolation.CLAMP),
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [EXPANDED_Y, COLLAPSED_Y], [1, 0], Extrapolation.CLAMP),
  }));

  const pillAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - isExpandedOpacity.value,
  }));

  const searchAnimStyle = useAnimatedStyle(() => ({
    opacity: isExpandedOpacity.value,
  }));

  const defaultContentStyle = useAnimatedStyle(() => ({
    opacity: defaultContentOpacity.value,
  }));

  const bg = isDark ? 'rgba(20,20,20,0.97)' : 'rgba(245,245,244,0.97)';
  const pillBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const pillBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const iconColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
  const textColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
  const placeholderColor = isDark ? '#737373' : '#a3a3a3';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#e5e5e5';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const backdropBg = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)';
  const chipBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const actionIconBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const sectionLabelColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const pillContainerHeight = Math.round(INSET_BOTTOM);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: backdropBg }, backdropAnimStyle]}
        pointerEvents={expanded ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={collapse} />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, height: screenHeight, backgroundColor: bg },
          panelAnimStyle,
        ]}
        pointerEvents="box-none"
      >
        {/* Draggable header — GestureDetector only here, not over the scroll list */}
        <GestureDetector gesture={panGesture}>
          <View pointerEvents="box-none">
            {/* Pill — absolute at top of panel, visible when collapsed */}
            <Animated.View
              style={[
                styles.pillWrap,
                { position: 'absolute', top: 0, height: pillContainerHeight, backgroundColor: 'transparent' },
                pillAnimStyle,
              ]}
              pointerEvents={expanded ? 'none' : 'auto'}
            >
              <View style={{ width: '100%', maxWidth: 384, paddingHorizontal: 8, paddingTop: (NAV_HEIGHT - PILL_HEIGHT) / 2 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={expand}
                  style={[styles.pill, { backgroundColor: pillBg, borderColor: pillBorder }]}
                >
                  <Ionicons name="search" size={18} color={iconColor} style={{ opacity: 0.5 }} />
                  <Text style={[styles.pillLabel, { color: iconColor, opacity: 0.5 }]}>Search</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Search input — fades in as panel expands */}
            <Animated.View
              style={[{ padding: 12, paddingBottom: 0 }, searchAnimStyle]}
              pointerEvents={expanded ? 'auto' : 'none'}
            >
              <View style={[styles.inputRow, { borderColor, backgroundColor: inputBg }]}>
                <View style={styles.searchIconWrap}>
                  <Ionicons name="search" size={20} color={iconColor} style={{ opacity: 0.5 }} />
                </View>

                <TextInput
                  ref={inputRef}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    defaultContentOpacity.value = withTiming(text.length > 0 ? 0 : 1, { duration: 150 });
                  }}
                  placeholder="Search..."
                  placeholderTextColor={placeholderColor}
                  style={[styles.input, { color: textColor }]}
                  returnKeyType="search"
                />

                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={() => {
                      setSearchQuery('');
                      defaultContentOpacity.value = withTiming(1, { duration: 150 });
                      inputRef.current?.focus();
                    }}
                  >
                    <Text style={{ fontSize: 22, color: iconColor }}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Expanded content — quick actions + scrollable action list */}
        {expanded && (
          <View style={{ height: screenHeight - EXPANDED_Y - 60 }}>
            {/* Scrollable action list — SectionList scrolls freely, overscroll collapses */}
            <GestureDetector gesture={listPanGesture}>
            <NativeViewGestureHandler ref={listGestureRef}>
            <AnimatedSectionList
              sections={sectionsData}
              keyExtractor={(item) => item.id}
              onScroll={listScrollHandler}
              scrollEventThrottle={16}
              bounces={false}
              keyboardDismissMode={isAtTop ? 'interactive' : 'none'}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              contentContainerStyle={{ paddingTop: 4 }}
              ListFooterComponent={<KeyboardPlaceholder />}
              ListHeaderComponent={
                searchQuery.length === 0 ? (
                  <Animated.View
                    style={[{ paddingTop: 16, paddingHorizontal: 14, paddingBottom: 4 }, defaultContentStyle]}
                    pointerEvents="box-none"
                  >
                    <View style={styles.quickActionsWrap}>
                      {QUICK_ACTIONS.map((action) => {
                        const color = isDark && action.colorDark ? action.colorDark : action.color;
                        return (
                          <TouchableOpacity
                            key={action.id}
                            activeOpacity={0.7}
                            style={[styles.quickActionChip, { backgroundColor: chipBg }]}
                          >
                            <View style={[styles.quickActionIconBox, { backgroundColor: hexToRgba(action.color, 0.1), borderColor: hexToRgba(action.color, 0.08) }]}>
                              <Ionicons name={action.icon} size={16} color={color} />
                            </View>
                            <Text style={[styles.quickActionChipLabel, { color: textColor }]}>{action.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </Animated.View>
                ) : null
              }
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: sectionLabelColor }]}>
                    {section.title}
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.6} style={styles.actionRow}>
                  <View style={[styles.actionIconWrap, { backgroundColor: actionIconBg }]}>
                    <Ionicons name={item.icon} size={18} color={iconColor} style={{ opacity: 0.8 }} />
                  </View>
                  <Text style={[styles.actionLabel, { color: textColor }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            </NativeViewGestureHandler>
            </GestureDetector>

          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    height: 48,
  },
  searchIconWrap: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    height: 48,
    paddingLeft: 40,
    paddingRight: 16,
  },
  clearBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillWrap: {
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 32,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingRight: 12,
    overflow: 'hidden',
  },
  quickActionIconBox: {
    width: 32,
    height: 32,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickActionChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.75,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
