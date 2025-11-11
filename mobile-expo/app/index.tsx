import React from 'react';
import { SafeAreaView } from 'react-native';
import { HomePage } from '@/components/HomePage';

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomePage />
    </SafeAreaView>
  );
}
