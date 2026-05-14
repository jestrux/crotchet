import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '@/lib/registry';

const DURATION = 2500;

export function Toast() {
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!message) return;

    clearTimeout(timer.current);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(DURATION),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) hide();
    });

    return () => clearTimeout(timer.current);
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View
      style={{ opacity, bottom: insets.bottom + 24 }}
      className="absolute self-center bg-neutral-800 dark:bg-neutral-200 px-4 py-2.5 rounded-full"
      pointerEvents="none"
    >
      <Text className="text-white dark:text-neutral-900 text-sm font-medium">{message}</Text>
    </Animated.View>
  );
}
