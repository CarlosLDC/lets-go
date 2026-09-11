import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as RNStatusBar } from 'react-native';
import { supabase } from '../../utils/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Datos incompletos', 'Ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      let mensaje = 'No pudimos iniciar sesión. Verifica tus datos.';
      if (error.message.includes('Invalid login credentials')) {
        mensaje = 'Correo o contraseña incorrectos.';
      } else if (error.message.includes('Email not confirmed')) {
        mensaje = 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.';
      } else if (error.message.includes('Too many requests')) {
        mensaje = 'Demasiados intentos. Espera un momento e intenta de nuevo.';
      }
      Alert.alert('Error al iniciar sesión', mensaje);
      return;
    }

    // El listener en _layout.tsx se encarga de la navegación
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Ingresa tu correo', 'Escribe tu correo electrónico para recuperar tu contraseña.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (!error) {
      Alert.alert(
        'Correo enviado',
        'Revisa tu correo electrónico para restablecer tu contraseña.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      {Platform.OS === 'android' && (
        <RNStatusBar backgroundColor={Colors.navy} barStyle="light-content" />
      )}
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.offWhite }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <LinearGradient
            colors={Gradients.darkHero}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.3, y: 1 }}
            style={styles.hero}
          >
            <LinearGradient
              colors={Gradients.darkShimmer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Text style={styles.logoP}>P</Text>
              <View style={styles.logoArrow}>
                <Text style={styles.logoArrowText}>↗</Text>
              </View>
            </LinearGradient>
            <Text style={styles.brandName}>LetsGo</Text>
            <Text style={styles.tagline}>Tu parqueo, en un toque</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Inicia sesión</Text>
            <Text style={styles.formSubtitle}>
              Ingresa tu correo electrónico y contraseña
            </Text>

            <TextInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="email" color={Colors.textSecondary} />}
              placeholder="correo@ejemplo.com"
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="lock" color={Colors.textSecondary} />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye-off' : 'eye'}
                  color={Colors.textSecondary}
                  onPress={() => setPasswordVisible((v) => !v)}
                />
              }
            />

            <Text style={styles.forgotLink} onPress={handleForgotPassword}>
              ¿Olvidaste tu contraseña?
            </Text>

            <AppButton
              label="Entrar"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
              style={styles.loginBtn}
            />

            <AppButton
              label="Crear cuenta"
              onPress={() => router.push('/(auth)/register')}
              variant="outline"
            />
          </View>

          <Text style={styles.footer}>
            Al ingresar, aceptas los{' '}
            <Text style={styles.link}>Términos de Servicio</Text> y la{' '}
            <Text style={styles.link}>Política de Privacidad</Text>.
          </Text>

          <Text style={[styles.footer, { marginTop: 12 }]}>
            ¿Tienes un estacionamiento?{' '}
            <Text
              style={styles.link}
              onPress={() => router.push('/(auth)/register-operator' as any)}
            >
              Regístralo aquí
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.navy },
  scroll: { flexGrow: 1, paddingBottom: 32, backgroundColor: Colors.offWhite },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  logoP: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 52,
  },
  logoArrow: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.mint,
    borderRadius: 6,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoArrowText: { color: Colors.navy, fontSize: 12, fontWeight: '700' },
  brandName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
  },
  tagline: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 6,
  },
  form: {
    paddingHorizontal: 24,
    gap: 14,
  },
  formTitle: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  formSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.white,
  },
  forgotLink: {
    ...Typography.bodySmall,
    color: Colors.mint,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -4,
  },
  loginBtn: { marginTop: 4 },
  footer: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  link: { color: Colors.mint, fontWeight: '600' },
});
