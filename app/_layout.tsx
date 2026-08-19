import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppTheme } from '../constants/theme';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

import { Colors } from '../constants/colors';

import { StatusBar as RNStatusBar, Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.offWhite }}>
      <PaperProvider theme={AppTheme}>
        <StatusBar style="dark" />
        {Platform.OS === 'android' && (
          <RNStatusBar backgroundColor={Colors.offWhite} barStyle="dark-content" />
        )}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="recharge" />
          <Stack.Screen name="parking/[id]" />
          <Stack.Screen name="history" />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
