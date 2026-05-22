import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { WallpaperBackground } from '@/components/WallpaperBackground';
import { WidgetShell } from '@/components/WidgetShell';
import { useWidgetStore, useActionStore, useHomeShortcutsStore, IconDescriptor } from '@/lib/registry';
import { useTheme } from '@/components/theming';
import { useWallpaper } from '@/hooks/useWallpaper';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const LIGHT_WALLPAPER = require('@/assets/images/light-wallpaper.jpg');
const DARK_WALLPAPER = require('@/assets/images/dark-wallpaper.jpg');

function ShortcutIcon({ icon, color }: { icon: IconDescriptor; color: string }) {
  if (!icon || icon.type === 'svg') return <Ionicons name="flash-outline" size={16} color={color} />;
  return <Ionicons name={icon.name as React.ComponentProps<typeof Ionicons>['name']} size={16} color={color} />;
}


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const wallpaper = useWallpaper();
  const { colorScheme, colors } = useTheme();
  const isDark = colorScheme === 'dark';
  const widgets = useWidgetStore((s) => s.widgets);
  const allActions = useActionStore((s) => s.actions);
  const shortcutNames = useHomeShortcutsStore((s) => s.shortcutNames);
  const shortcuts = shortcutNames
    .map((name) => allActions.find((a) => a.name === name))
    .filter(Boolean) as typeof allActions;
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });

  return (
    <View className="flex-1 bg-stone-300/95 dark:bg-stone-900/95">
      {/* Fixed ambient blur — mirrors main app's blurred wallpaper background */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject} className="fixed inset-0 bg-background">
        {isDark ? (
          <Image
            source={DARK_WALLPAPER}
            style={StyleSheet.absoluteFillObject}
            className="w-full h-full opacity-50"
            blurRadius={60}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={LIGHT_WALLPAPER}
            className="w-full h-full opacity-50"
            blurRadius={300}
            resizeMode="cover"
          />
        )}
      </View>
      <AnimatedScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={{ maxWidth: 512, width: '100%', alignSelf: 'center', paddingHorizontal: 16, gap: 16 }}>
          <WallpaperBackground wallpaper={wallpaper} scrollY={scrollY} />
          {/* Centered header */}
          <View style={{ paddingTop: insets.top + 24, marginBottom: 4 }}>
            <Text className="text-3xl font-bold text-foreground text-center">Hey Walter,</Text>
            <Text className="text-lg text-foreground mt-1 text-center">Here's how things are looking</Text>
          </View>

          {/* Shortcuts — backed by homePageShortcuts preference */}
          {shortcuts.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, rowGap: 8, justifyContent: 'center' }}>
              {shortcuts.map((action) => (
                <Pressable
                  key={action.name}
                  onPress={() => action.handler?.()}
                  className="flex-row items-center bg-card dark:bg-foreground/[0.05] shadow-sm dark:shadow-none dark:border dark:border-stroke rounded-full"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View className="bg-foreground/[0.06] dark:border dark:border-foreground/[0.08]" style={{ width: 32, height: 32, marginLeft: 8, marginVertical: 6, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                    <ShortcutIcon icon={action.icon} color={colors.iconStrong} />
                  </View>
                  <Text className="text-foreground text-sm font-medium" style={{ marginRight: 20, marginLeft: 6 }}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Extension widgets */}
          {widgets.map((widget) => (
            <WidgetShell key={widget.name} widget={widget} />
          ))}
        </View>
      </AnimatedScrollView>

      <BottomNav />
    </View>
  );
}
