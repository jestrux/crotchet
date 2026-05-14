import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { WallpaperBackground } from '@/components/WallpaperBackground';
import { WidgetShell } from '@/components/WidgetShell';
import { useWidgetStore } from '@/lib/registry';
import { useTheme } from '@/components/theming';
import { useWallpaper } from '@/hooks/useWallpaper';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);


type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const LIGHT_WALLPAPER = require('@/assets/images/light-wallpaper.jpg');
const DARK_WALLPAPER = require('@/assets/images/dark-wallpaper.jpg');

const SHORTCUTS: { id: string; label: string; icon: IoniconName }[] = [
  { id: 'spotify', label: 'Random Track', icon: 'logo-spotify' },
  { id: 'unsplash', label: 'Random Pic', icon: 'image-outline' },
  { id: 'youtube', label: 'Random Clip', icon: 'logo-youtube' },
  { id: 'pinboard', label: 'Pinboard', icon: 'pin-outline' },
];


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const wallpaper = useWallpaper();
  const { colorScheme, colors } = useTheme();
  const isDark = colorScheme === 'dark';
  const widgets = useWidgetStore((s) => s.widgets);
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
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, gap: 16 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <WallpaperBackground wallpaper={wallpaper} scrollY={scrollY} />

        {/* Centered header */}
        <View style={{ paddingTop: insets.top + 24, marginBottom: 4 }}>
          <Text className="text-3xl font-bold text-foreground text-center">Hey Walter,</Text>
          <Text className="text-lg text-foreground mt-1 text-center">Here's how things are looking</Text>
        </View>

        {/* Shortcuts — centered wrap, neutral icon circles (no color) */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, rowGap: 8, justifyContent: 'center' }}>
          {SHORTCUTS.map((s) => (
            <Pressable
              key={s.id}
              className="flex-row items-center bg-card dark:bg-foreground/[0.05] shadow-sm dark:shadow-none dark:border dark:border-stroke rounded-full"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              {/* Neutral circle: bg-foreground/[0.06] border-foreground/10 */}
              <View className="bg-foreground/[0.06] dark:border dark:border-foreground/[0.08]" style={{ width: 32, height: 32, marginLeft: 8, marginVertical: 6, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={s.icon} size={16} color={colors.iconStrong} />
              </View>
              <Text className="text-foreground text-sm font-medium" style={{ marginRight: 20, marginLeft: 6 }}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Extension widgets */}
        {widgets.map((widget) => (
          <WidgetShell key={widget.name} widget={widget} />
        ))}
      </AnimatedScrollView>

      <BottomNav />
    </View>
  );
}
