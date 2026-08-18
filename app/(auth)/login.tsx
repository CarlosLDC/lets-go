import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { useAppStore } from '../../store/useAppStore';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as RNStatusBar } from 'react-native';

export default function LoginScreen() {
  const [phone, setPhone] = useState('0414-');
  const [cedula, setCedula] = useState('V-');
  const [loading, setLoading] = useState(false);
  const login = useAppStore((s) => s.login);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    login(phone, cedula);
    setLoading(false);
    router.replace('/(tabs)');
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
              Ingresa tu número de teléfono y cédula
            </Text>

            <TextInput
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="phone" color={Colors.textSecondary} />}
              placeholder="0414-000-0000"
            />

            <TextInput
              label="Cédula de identidad"
              value={cedula}
              onChangeText={setCedula}
              keyboardType="default"
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="card-account-details" color={Colors.textSecondary} />}
              placeholder="V-12.345.678"
            />

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

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} onPress={handleLogin}>
                <Text style={styles.socialEmoji}>📱</Text>
                <Text style={styles.socialLabel}>Pago Móvil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={handleLogin}>
                <Text style={styles.socialEmoji}>🔑</Text>
                <Text style={styles.socialLabel}>PIN</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>
            Al ingresar, aceptas los{' '}
            <Text style={styles.link}>Términos de Servicio</Text> y la{' '}
            <Text style={styles.link}>Política de Privacidad</Text>.
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
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
  },
  loginBtn: { marginTop: 4 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { ...Typography.bodySmall, color: Colors.textDisabled },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialEmoji: { fontSize: 20 },
  socialLabel: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '600' },
  footer: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  link: { color: Colors.mint, fontWeight: '600' },
});
