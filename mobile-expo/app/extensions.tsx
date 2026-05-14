import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useExtensionStore, ExtensionRecord } from '@/lib/registry';
import { updateExtension } from '@/lib/firebase-sync';
import { useTheme } from '@/components/theming';

function ExtensionRow({ item }: { item: ExtensionRecord }) {
  const { colors } = useTheme();
  const [updating, setUpdating] = useState(false);
  const iconColor = colors.iconSubtle;

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateExtension(item.id);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View className="bg-card dark:bg-foreground/[0.04] border border-stroke rounded-2xl mx-4 mb-3 overflow-hidden">
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
        {/* Icon */}
        <View
          className="bg-foreground/[0.06]"
          style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
        >
          {item.meta.icon ? (
            <Text style={{ fontSize: 22 }}>{item.meta.icon}</Text>
          ) : (
            <Ionicons name="puzzle-outline" size={22} color={iconColor} />
          )}
        </View>

        {/* Name + description */}
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text className="text-foreground font-semibold" style={{ fontSize: 15 }}>
              {item.meta.name || item.id}
            </Text>
            {item.meta.version ? (
              <View className="bg-foreground/[0.07]" style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                <Text className="text-foreground/50" style={{ fontSize: 11, fontWeight: '600' }}>
                  v{item.meta.version}
                </Text>
              </View>
            ) : null}
          </View>
          {item.meta.description ? (
            <Text className="text-foreground/50" style={{ fontSize: 13 }} numberOfLines={2}>
              {item.meta.description}
            </Text>
          ) : null}
        </View>

        {/* Update button */}
        <Pressable
          onPress={handleUpdate}
          disabled={updating}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          {updating ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <Ionicons name="refresh-outline" size={20} color={iconColor} />
          )}
        </Pressable>
      </View>

      {item.meta.author ? (
        <View className="border-t border-stroke" style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text className="text-foreground/30" style={{ fontSize: 12 }}>
            by {item.meta.author}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ExtensionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { extensions, status } = useExtensionStore();
  const iconColor = colors.icon;

  const extensionList = Object.values(extensions).sort((a, b) =>
    (a.meta.name || a.id).localeCompare(b.meta.name || b.id)
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
        >
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </Pressable>
        <Text className="text-foreground font-bold" style={{ fontSize: 20, flex: 1 }}>
          Extensions
        </Text>
        {status === 'loading' && <ActivityIndicator size="small" color={iconColor} />}
      </View>

      {status === 'loading' && extensionList.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={iconColor} />
          <Text className="text-foreground/40" style={{ fontSize: 14 }}>
            Loading extensions...
          </Text>
        </View>
      ) : extensionList.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Ionicons name="puzzle-outline" size={40} color={iconColor} style={{ opacity: 0.3 }} />
          <Text className="text-foreground/40" style={{ fontSize: 14 }}>
            No extensions installed
          </Text>
        </View>
      ) : (
        <FlatList
          data={extensionList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExtensionRow item={item} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
