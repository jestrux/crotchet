import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useTheme } from './theming';

const LIGHT_WALLPAPER =
  'https://images.unsplash.com/photo-1624847706671-a7bf2f92ede0?w=900&auto=format&fit=crop&q=60';
const DARK_WALLPAPER =
  'https://images.unsplash.com/photo-1622482607282-fffed5a93942?q=80&w=985&auto=format&fit=crop';

const WALLPAPER_HEIGHT = 380;
// Horizontal padding of the ScrollView content — we negate it to go full-bleed
const H_PADDING = 16;

export function WallpaperBackground({ wallpaper, scrollY }: { wallpaper: string; scrollY: SharedValue<number> }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  // Negate both the content padding and the centering offset from maxWidth: 512
  const marginHorizontal = -(H_PADDING + Math.max(0, screenWidth - 512) / 2);

  const imageAnimStyle = useAnimatedStyle(() => {
    if (scrollY.value >= 0) return {};
    const pull = -scrollY.value;
    const dampened = pull / (1 + pull / WALLPAPER_HEIGHT);
    const scale = 1 + dampened / WALLPAPER_HEIGHT;
    // translateY cancels the native bounce displacement so the image stays pinned
    return { transform: [{ translateY: scrollY.value }, { scale }] };
  });

  if (wallpaper === 'none') return null;

  const uri =
    wallpaper === 'auto' ? (isDark ? DARK_WALLPAPER : LIGHT_WALLPAPER) : wallpaper;

  return (
    <View
      pointerEvents="none"
      style={{
        height: WALLPAPER_HEIGHT,
        marginHorizontal,
        marginBottom: -(WALLPAPER_HEIGHT - 140),
      }}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, imageAnimStyle]}>
        <ImageBackground
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          imageStyle={{ resizeMode: 'cover' }}
        >
          {/* <LinearGradient
            colors={
              isDark
                ? ['transparent', 'transparent', 'rgba(10,10,10,0.6)']
                : ['transparent', 'transparent', '#d6d3d1']
            }
            locations={[0, 0.6, 0.8]}
            style={StyleSheet.absoluteFillObject}
          /> */}
        </ImageBackground>
      </Animated.View>
    </View>
  );
}
