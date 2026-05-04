import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from './theming';

const LIGHT_WALLPAPER =
  'https://images.unsplash.com/photo-1624847706671-a7bf2f92ede0?w=900&auto=format&fit=crop&q=60';
const DARK_WALLPAPER =
  'https://images.unsplash.com/photo-1622482607282-fffed5a93942?q=80&w=985&auto=format&fit=crop';

export function WallpaperBackground({ wallpaper }: { wallpaper: string }) {
  const { colorScheme } = useTheme();
  const { height } = useWindowDimensions();

  if (wallpaper === 'none') return null;

  const uri =
    wallpaper === 'auto'
      ? colorScheme === 'dark'
        ? DARK_WALLPAPER
        : LIGHT_WALLPAPER
      : wallpaper;

  if (colorScheme === 'light') {
    // Bottom half only — fade in from top edge, fade out at bottom
    return (
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { top: height / 2 }]}
      >
        <ImageBackground
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          imageStyle={{ resizeMode: 'cover' }}
          blurRadius={30}
        >
          <LinearGradient
            colors={['rgba(240,240,240,1)', 'rgba(240,240,240,0)', 'rgba(240,240,240,0.6)']}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>
      </View>
    );
  }

  // Dark — full screen, fade in from top, fade out at bottom
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <ImageBackground
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{ resizeMode: 'cover' }}
        blurRadius={12}
      >
        <LinearGradient
          colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.25, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>
    </View>
  );
}
