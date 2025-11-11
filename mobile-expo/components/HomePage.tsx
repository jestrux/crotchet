import React from 'react';
import { View, Text, Platform, StatusBar } from 'react-native';
import { useApp } from '@/providers/AppProvider';

export function HomePage() {
  const { userName } = useApp();

  return (
    <View
      className="flex-1"
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-base font-medium mb-1 text-muted-foreground">
          Hey {userName},
        </Text>
        <Text className="text-[28px] font-bold leading-[34px] text-foreground">
          Here's how things are looking
        </Text>
      </View>
    </View>
  );
}
