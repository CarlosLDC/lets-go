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
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { PhoneInput } from '../../components/ui/PhoneInput';
import {
  validatePhoneNumber,
  formatFullPhone,
} from '../../constants/identityAndPhone';
import { supabase } from '../../utils/supabase';

export default function RegisterOperatorScreen() {
  const [operatorName, setOperatorName] = useState('');
  const [rif, setRif] = useState('J-');
  const [phonePrefix, setPhonePrefix] = useState('0412');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isNationalPhone, setIsNationalPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneValidation = validatePhoneNumber(phonePrefix, phoneNumber, isNationalPhone);

  const isValid =
    operatorName.trim().length > 2 &&
    rif.length > 3 &&
    phoneValidation.isValid &&
    email.includes('@') &&
    password.length >= 8;

  const handleRegister = async () => {
    if (!isValid) return;
    setLoading(true);

    const fullPhone = formatFullPhone(phonePrefix, phoneNumber);

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          account_type: 'operator',
          operator_name: operatorName.trim(),
          operator_rif: rif.trim(),
          operator_phone: fullPhone,
        },
      },
    });

    setLoading(false);

    if (error) {
      let mensaje = 'Ocurrió un error al registrarte. Intenta de nuevo.';
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        mensaje = 'Este correo ya está registrado. ¿Quieres iniciar sesión?';
      } else if (error.message.includes('Password should')) {
        mensaje = 'La contraseña es muy débil. Usa al menos 8 caracteres.';
      }
      Alert.alert('Error al registrarte', mensaje);
      return;
    }

    Alert.alert(
      'Solicitud enviada',
      'Registramos tu empresa. Un administrador revisará tu solicitud y te notificará por correo cuando sea aprobada.',
      [{ text: 'Entendido', onPress: () => router.replace('/(auth)/login') }],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Para propietarios</Text>
            <Text style={styles.title}>Registra tu estacionamiento</Text>
            <Text style={styles.subtitle}>
              Crea tu cuenta de operador. Una vez aprobada podras gestionar tus lotes y ver las
              sesiones en tiempo real.
            </Text>
          </View>

          <View style={styles.reviewBadge}>
            <Text style={styles.reviewIcon}>🔍</Text>
            <Text style={styles.reviewText}>
              Tu solicitud sera revisada antes de activarse. Esto nos ayuda a garantizar la calidad
              de los establecimientos en la plataforma.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionLabel}>Datos de la empresa</Text>

            <TextInput
              label="Nombre del estacionamiento / empresa"
              value={operatorName}
              onChangeText={setOperatorName}
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="domain" color={Colors.textSecondary} />}
              placeholder="Ej: Parqueo Las Mercedes C.A."
            />

            <TextInput
              label="RIF"
              value={rif}
              onChangeText={setRif}
              mode="outlined"
              style={styles.input}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="file-document" color={Colors.textSecondary} />}
              placeholder="J-12345678-9"
              autoCapitalize="characters"
            />

            <PhoneInput
              label="Teléfono de contacto"
              prefix={phonePrefix}
              onPrefixChange={(p, nat) => {
                setPhonePrefix(p);
                setIsNationalPhone(nat);
              }}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              isNational={isNationalPhone}
            />

            <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Cuenta de acceso</Text>

            <TextInput
              label="Correo electronico"
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

            <TextInput
              label="Contraseña (mín. 8 caracteres)"
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

            <AppButton
              label="Enviar solicitud"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
            />

            <AppButton
              label="Volver al inicio de sesion"
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
  header: { marginBottom: 16, marginTop: 8 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.mint,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: { ...Typography.displayMedium, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 6, lineHeight: 22 },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '18',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  reviewIcon: { fontSize: 18 },
  reviewText: { ...Typography.bodySmall, color: Colors.navyLight, flex: 1, lineHeight: 18 },
  form: { gap: 14 },
  sectionLabel: { ...Typography.labelMedium, color: Colors.textSecondary },
  input: { backgroundColor: Colors.white },
});
