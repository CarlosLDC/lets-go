import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
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
import { supabase } from '../utils/supabase';
import { useAppStore } from '../store/useAppStore';

import { StatusBar as RNStatusBar, Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const setUser = useAppStore((s) => s.setUser);
  const logout = useAppStore((s) => s.logout);
  const setOperator = useAppStore((s) => s.setOperator);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Listener de sesión de Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Cargar el perfil del usuario desde la DB
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (profile) {
            setUser({
              userId: profile.id,
              name: profile.full_name,
              phone: profile.phone,
              cedula: profile.cedula,
              email: session.user.email ?? '',
              balanceUsd: parseFloat(profile.balance_usd ?? '0'),
            });

            // Verificar si es miembro de un operador
            const { data: membership } = await supabase
              .from('operator_members')
              .select('operator_id, operators(name, is_active)')
              .eq('auth_user_id', session.user.id)
              .single();

            if (membership?.operators) {
              const opData = membership.operators;
              const op = Array.isArray(opData) ? opData[0] : opData;
              if (op) {
                setOperator(membership.operator_id, op.name, op.is_active);
              }
            }

            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
              router.replace('/(tabs)');
            }
          }
        } else {
          // No hay sesión — limpiar store y redirigir al login
          logout();
          if (event === 'SIGNED_OUT') {
            router.replace('/(auth)/login');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, logout, setOperator]);

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
