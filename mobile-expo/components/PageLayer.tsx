import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePageStore, PageRecord } from '@/lib/registry';
import { useTheme } from './theming';

const TIMING = { duration: 300, easing: Easing.out(Easing.cubic) };

// Resolves title — may be a function or a plain string
function resolveTitle(title: PageRecord['title'], pageData: any): string {
  if (!title) return '';
  if (typeof title === 'function') return title({ pageData }) ?? '';
  return title;
}

function PageContent({ page }: { page: PageRecord }) {
  const { colors } = useTheme();
  const [data, setData] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const { popPage } = usePageStore();

  useEffect(() => {
    if (!page.resolve) return;
    setLoading(true);
    page.resolve()
      .then((result) => {
        setData(result);
        if (page.onReady) {
          page.onReady({
            pageData: result,
            setPageData: setData,
            closePage: popPage,
          });
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.icon} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cube-outline" size={40} color={colors.iconGhost} />
        <Text style={{ color: colors.iconSubtle, fontSize: 14, marginTop: 10 }}>
          Nothing here yet
        </Text>
      </View>
    );
  }

  // Phase 6 will render real data — for now just show a placeholder
  return (
    <View style={styles.centered}>
      <Text style={{ color: colors.icon, fontSize: 13 }}>Data loaded</Text>
    </View>
  );
}

function SheetContent({ page }: { page: PageRecord }) {
  const { colors } = useTheme();
  const { popPage } = usePageStore();
  const actions: any[] = page.actions ?? [];

  if (!actions.length) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.iconSubtle, fontSize: 14 }}>No options</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 8 }}>
      {actions.map((action: any, i: number) => (
        <TouchableOpacity
          key={i}
          activeOpacity={0.6}
          style={styles.sheetRow}
          onPress={() => {
            popPage();
            action.handler?.();
          }}
        >
          <Text style={{ fontSize: 16, color: colors.icon }}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PageModal({ page, onDismiss }: { page: PageRecord; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [pageData] = useState<any>(undefined);

  const translateY = useSharedValue(600);

  useEffect(() => {
    translateY.value = withTiming(0, TIMING);
  }, []);

  const dismiss = () => {
    translateY.value = withTiming(600, TIMING, () => runOnJS(onDismiss)());
  };

  const panGesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationY > 80) runOnJS(dismiss)();
      else translateY.value = withTiming(0, TIMING);
    })
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const title = resolveTitle(page.title, pageData);
  const isSheet = page.isSheet;

  return (
    <Animated.View
      style={[
        isSheet ? styles.sheet : styles.fullPage,
        { paddingBottom: insets.bottom },
        animStyle,
      ]}
      className="bg-card"
    >
      <GestureDetector gesture={panGesture}>
        <View style={styles.handle}>
          <View style={styles.handleBar} className="bg-foreground/20" />
          {!isSheet && (
            <View style={styles.headerRow}>
              {title ? (
                <Text className="text-foreground" style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              <Pressable
                onPress={dismiss}
                style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.5 : 1 }]}
              >
                <Ionicons name="close" size={20} color={colors.icon} />
              </Pressable>
            </View>
          )}
        </View>
      </GestureDetector>

      {isSheet ? <SheetContent page={page} /> : <PageContent page={page} />}
    </Animated.View>
  );
}

export function PageLayer() {
  const { pages, popPage } = usePageStore();

  if (!pages.length) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={popPage} />
      {/* Render the top page only */}
      <PageModal key={pages[pages.length - 1].id} page={pages[pages.length - 1]} onDismiss={popPage} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullPage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 120,
  },
  handle: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sheetRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
});
