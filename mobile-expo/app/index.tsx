import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { WallpaperBackground } from '@/components/WallpaperBackground';
import { useTheme } from '@/components/theming';
import { useWallpaper } from '@/hooks/useWallpaper';

const PLACEHOLDER_CARDS = Array.from({ length: 7 });

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const wallpaper = useWallpaper();
  const { colorScheme } = useTheme();

  return (
    <View className={`flex-1 bg-background ${colorScheme === 'dark' ? 'dark' : ''}`}>
      <WallpaperBackground wallpaper={wallpaper} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: 100,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <View style={{ marginBottom: 8 }}>
          <Text className="text-3xl font-bold text-foreground">Hey Walter</Text>
          <Text className="text-base text-foreground/60 mt-1">
            Here's how things are looking
          </Text>
        </View>

        {PLACEHOLDER_CARDS.map((_, i) => (
          <View key={i} className="bg-card rounded-2xl p-4 border border-stroke">
            <View className="h-4 w-3/4 bg-foreground/10 rounded-full mb-3" />
            <View className="h-3 w-full bg-foreground/5 rounded-full mb-2" />
            <View className="h-3 w-2/3 bg-foreground/5 rounded-full" />
          </View>
        ))}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
