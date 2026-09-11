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
import { DocumentInput } from '../../components/ui/DocumentInput';
import { PhoneInput } from '../../components/ui/PhoneInput';
import {
  DocumentType,
  validateDocument,
  validatePhoneNumber,
  formatFullCedula,
  formatFullPhone,
} from '../../constants/identityAndPhone';
import { supabase } from '../../utils/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('V');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('0414');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isNationalPhone, setIsNationalPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (name.trim().length < 3) newErrors.name = 'Ingresa tu nombre completo';

    const docResult = validateDocument(documentType, documentNumber);
    if (!docResult.isValid && docResult.error) {
      newErrors.cedula = docResult.error;
    }

    const phoneResult = validatePhoneNumber(phonePrefix, phoneNumber, isNationalPhone);
    if (!phoneResult.isValid && phoneResult.error) {
      newErrors.phone = phoneResult.error;
    }

    if (!email.includes('@') || !email.includes('.')) newErrors.email = 'Ingresa un correo válido';
    if (password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    const fullCedula = formatFullCedula(documentType, documentNumber);
    const fullPhone = formatFullPhone(phonePrefix, phoneNumber);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          account_type: 'user',
          full_name: name.trim(),
          phone: fullPhone,
          cedula: fullCedula,
        },
      },
    });

    setLoading(false);

    if (error) {
      let mensaje = 'Ocurrió un error al registrarte. Intenta de nuevo.';
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        mensaje = 'Este correo ya está registrado. ¿Quieres iniciar sesión?';
      } else if (error.message.includes('profiles_phone_key') || error.message.toLowerCase().includes('phone')) {
        mensaje = 'Este número de teléfono ya está registrado.';
      } else if (error.message.includes('profiles_cedula_key') || error.message.toLowerCase().includes('cedula')) {
        mensaje = 'Este documento de identidad ya está registrado.';
      } else if (error.message.includes('Password should')) {
        mensaje = 'La contraseña es muy débil. Usa al menos 8 caracteres.';
      } else if (error.message.includes('Invalid email')) {
        mensaje = 'El correo electrónico no es válido.';
      }
      Alert.alert('Error al registrarte', mensaje);
      return;
    }

    if (data?.session) {
      // Sesión iniciada directamente (confirmación desactivada)
      Alert.alert(
        '¡Bienvenido a LetsGo!',
        'Tu cuenta ha sido creada exitosamente.',
        [{ text: 'Comenzar', onPress: () => router.replace('/(tabs)') }],
      );
    } else {
      // En caso de que se reactive la confirmación de correo
      Alert.alert(
        '¡Cuenta creada!',
        'Revisa tu bandeja de entrada para verificar tu correo antes de iniciar sesión.',
        [{ text: 'Entendido', onPress: () => router.replace('/(auth)/login') }],
      );
    }
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
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
              mode="outlined"
              style={styles.input}
              outlineColor={errors.name ? Colors.error : Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="account" color={Colors.textSecondary} />}
              error={!!errors.name}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <DocumentInput
              documentType={documentType}
              onDocumentTypeChange={(type) => {
                setDocumentType(type);
                setErrors((e) => ({ ...e, cedula: '' }));
              }}
              documentNumber={documentNumber}
              onDocumentNumberChange={(num) => {
                setDocumentNumber(num);
                setErrors((e) => ({ ...e, cedula: '' }));
              }}
              error={errors.cedula}
            />

            <PhoneInput
              prefix={phonePrefix}
              onPrefixChange={(p, nat) => {
                setPhonePrefix(p);
                setIsNationalPhone(nat);
                setErrors((e) => ({ ...e, phone: '' }));
              }}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={(num) => {
                setPhoneNumber(num);
                setErrors((e) => ({ ...e, phone: '' }));
              }}
              isNational={isNationalPhone}
              error={errors.phone}
            />

            <TextInput
              label="Correo electrónico"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              mode="outlined"
              style={styles.input}
              outlineColor={errors.email ? Colors.error : Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="email" color={Colors.textSecondary} />}
              error={!!errors.email}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <TextInput
              label="Contraseña (mín. 8 caracteres)"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: '' })); }}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={styles.input}
              outlineColor={errors.password ? Colors.error : Colors.border}
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
              error={!!errors.password}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <TextInput
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: '' })); }}
              secureTextEntry={!confirmVisible}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={styles.input}
              outlineColor={errors.confirmPassword ? Colors.error : Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="lock-check" color={Colors.textSecondary} />}
              right={
                <TextInput.Icon
                  icon={confirmVisible ? 'eye-off' : 'eye'}
                  color={Colors.textSecondary}
                  onPress={() => setConfirmVisible((v) => !v)}
                />
              }
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

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
  form: { gap: 6 },
  input: { backgroundColor: Colors.white },
  errorText: { ...Typography.bodySmall, color: Colors.error, marginTop: -2, marginLeft: 4 },
  infoBox: {
    backgroundColor: Colors.mint + '18',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  infoText: { ...Typography.bodySmall, color: Colors.navyLight, lineHeight: 18 },
});
