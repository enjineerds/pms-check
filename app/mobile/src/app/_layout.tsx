import '@/global.css';

import { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useCSSVariable } from 'uniwind';
import { SplashTick } from '@/features/SplashTick';
import { sweepCaptures } from '@/ocr/capture';
import { useOutboxFlush } from '@/outbox';

SplashScreen.preventAutoHideAsync();
sweepCaptures();

export default function RootLayout() {
  const ground = useCSSVariable('--color-ground') as string;
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [splash, setSplash] = useState(true);
  useOutboxFlush();

  if (!loaded && !error) return null;

  return (
    <View className="flex-1 web:items-center web:bg-line">
      <View className="w-full max-w-[390px] flex-1 bg-ground">
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: ground } }} />
        {splash ? <SplashTick onDone={() => setSplash(false)} /> : null}
      </View>
    </View>
  );
}
