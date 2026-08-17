import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { useAppStore } from '../../store/useAppStore';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('0414-');
  const [cedula, setCedula] = useState('V-');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAppStore((s) => s.login);

  const handleRegister = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    login(phone, cedula);
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Ingresa tus datos para registrarte</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Nombre completo"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="account" color={Colors.textSecondary} />}
            />

            <TextInput
              label="Cédula de identidad"
              value={cedula}
              onChangeText={setCedula}
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="card-account-details" color={Colors.textSecondary} />}
              placeholder="V-12.345.678"
            />

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
              label="Correo electrónico (opcional)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="email" color={Colors.textSecondary} />}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Tus datos están protegidos y nunca serán compartidos con terceros.
              </Text>
            </View>

            <AppButton
              label="Registrarme"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
            />

            <AppButton
              label="Ya tengo cuenta"
              onPress={() => router.back()}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 28, marginTop: 8 },
  title: { ...Typography.displayMedium, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyLarge, color: Colors.textSecondary, marginTop: 6 },
  form: { gap: 14 },
  input: { backgroundColor: Colors.white },
  infoBox: {
    backgroundColor: Colors.mint + '18',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  infoText: { ...Typography.bodySmall, color: Colors.navyLight, lineHeight: 18 },
});
