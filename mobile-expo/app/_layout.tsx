import '../global.css';
import '../lib/firebase-sync'; // bootstraps extension sync as a side effect

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, NativeTheme } from '@/components/theming';
import { PageLayer } from '@/components/PageLayer';
import { SpotifyPlayer } from '@/components/SpotifyPlayer';
import { Toast } from '@/components/Toast';
import { usePageStore } from '@/lib/registry';
import { handleOauthRedirect } from '@/lib/globals/auth';

const TIMING = { duration: 350, easing: Easing.out(Easing.cubic) };

function AppShell() {
  const hasPages = usePageStore((s) => s.pages.length > 0);
  const scale = useSharedValue(1);
  const borderRadius = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Handle OAuth deep-link redirects (both cold-start and foreground)
  useEffect(() => {
    Linking.getInitialURL().then((url) => { if (url) handleOauthRedirect(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleOauthRedirect(url));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    scale.value = withTiming(hasPages ? 0.92 : 1, TIMING);
    borderRadius.value = withTiming(hasPages ? 16 : 0, TIMING);
    opacity.value = withTiming(hasPages ? 0.85 : 1, TIMING);
  }, [hasPages]);

  const animStyle = useAnimatedStyle(() => ({
    flex: 1,
    borderRadius: borderRadius.value,
    overflow: 'hidden',
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <Animated.View style={animStyle}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="extensions" options={{ headerShown: false }} />
        </Stack>
      </Animated.View>
      <PageLayer />
      <SpotifyPlayer />
      <Toast />
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaProvider>
        <ThemeProvider defaultTheme="system">
          <NativeTheme>
            <AppShell />
          </NativeTheme>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
