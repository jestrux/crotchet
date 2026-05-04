import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { WallpaperBackground } from '@/components/WallpaperBackground';
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

const UNSPLASH_PLACEHOLDER = {
  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=60',
  title: 'Alpine Valley',
  subtitle: 'Adrien Olichon',
};

const YOUTUBE_CLIPS = [
  { id: '1', title: 'Clip One', time: '0:00, 1:30 — 2:30', _id: 'dQw4w9WgXcQ' },
  { id: '2', title: 'Another Clip', time: '0:15, 2:00 — 3:45', _id: '9bZkp7q19f0' },
  { id: '3', title: 'Third Clip', time: '1:00, 3:10 — 4:20', _id: 'kTJczUoc26U' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const wallpaper = useWallpaper();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });

  return (
    <View className={`flex-1 bg-stone-300/95 dark:bg-stone-900/95 ${isDark ? 'dark' : ''}`}>
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
                <Ionicons name={s.icon} size={16} color={isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'} />
              </View>
              <Text className="text-foreground text-sm font-medium" style={{ marginRight: 20, marginLeft: 6 }}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Unsplash Random Pic widget — UI.media: full-bleed image, no header, aspectRatio 2/1.02 */}
        <View style={{ aspectRatio: 2 / 1.02, borderRadius: 16, overflow: 'hidden' }}>
          <Image
            source={{ uri: UNSPLASH_PLACEHOLDER.image }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            locations={[0.45, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
              {UNSPLASH_PLACEHOLDER.title}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }} numberOfLines={1}>
              {UNSPLASH_PLACEHOLDER.subtitle}
            </Text>
          </View>
        </View>

        {/* YouTube Clips widget — same 2/1.02 aspect ratio as Unsplash, list fills remaining height */}
        <View className="bg-card rounded-2xl border border-stroke overflow-hidden" style={{ aspectRatio: 2 / 1.02 }}>
          {/* Widget header h-10: icon + uppercase title */}
          <View style={{ height: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14 }} className="bg-foreground/[0.05]">
            <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="logo-youtube" size={16} color={isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'} />
            </View>
            <Text
              className="flex-1 text-foreground"
              style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.8 }}
            >
              Youtube Clips
            </Text>
          </View>
          {/* Action buttons — absolute top-right, floating over header like the web */}
          <View style={{ position: 'absolute', right: 10, top: 0, height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 }}>
            {(['search-outline', 'shuffle-outline'] as IoniconName[]).map((icon) => (
              <Pressable
                key={icon}
                style={({ pressed }) => ({
                  width: 28, height: 28, borderRadius: 999,
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <Ionicons name={icon} size={18} color={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)'} />
              </Pressable>
            ))}
          </View>
          {/* List fills remaining height. No flex:1 on rows — natural height py-[5px] + h-9 ≈ 46px each */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {YOUTUBE_CLIPS.map((clip) => (
              <TouchableOpacity
                key={clip.id}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 5, gap: 10 }}
              >
                {/* h-9 aspect-[1.45/1] rounded thumbnail with play overlay */}
                <View style={{ width: 52, height: 36, borderRadius: 4, overflow: 'hidden', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <Image source={{ uri: `https://i.ytimg.com/vi/${clip._id}/hqdefault.jpg` }} style={{ width: 52, height: 36 }} resizeMode="cover" />
                  <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="play" size={16} color="rgba(255,255,255,0.9)" style={{ marginLeft: 2 }} />
                  </View>
                </View>
                {/* Title + subtitle — space-y-[7px], leading-none */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)', fontSize: 14, lineHeight: 14 }} numberOfLines={1}>{clip.title}</Text>
                  <Text style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: 12, lineHeight: 12, marginTop: 4 }} numberOfLines={1}>{clip.time}</Text>
                </View>
                {/* Chevron right — opacity-30 */}
                <Ionicons name="chevron-forward" size={16} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </AnimatedScrollView>

      <BottomNav />
    </View>
  );
}
