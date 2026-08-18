import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAppStore } from '../../store/useAppStore';

function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger = false,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger && { color: Colors.error }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {onPress && <Text style={styles.settingArrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { userName, userPhone, userCedula, vehicles, logout } = useAppStore();
  const defaultVehicle = vehicles.find((v) => v.isDefault);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Perfil</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={Gradients.darkCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarInitials}>
              {userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userPhone}>{userPhone}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Cuenta verificada</Text>
          </View>
        </View>

        {/* Personal data */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos personales</Text>
          <SettingRow icon="🪪" label="Cédula" value={userCedula} />
          <SettingRow icon="📱" label="Teléfono" value={userPhone} onPress={() => {}} />
          <SettingRow icon="✉️" label="Correo" value="Sin correo" onPress={() => {}} />
        </View>

        {/* Vehicles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mis vehículos</Text>
          {vehicles.map((v) => (
            <SettingRow
              key={v.id}
              icon="🚗"
              label={`${v.brand} ${v.model}`}
              value={`${v.plate}${v.isDefault ? ' ·  Principal' : ''}`}
              onPress={() => {}}
            />
          ))}
          <SettingRow icon="➕" label="Agregar vehículo" onPress={() => {}} />
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuración</Text>
          <SettingRow icon="🔔" label="Notificaciones" onPress={() => {}} />
          <SettingRow icon="🌐" label="Idioma" value="Español" onPress={() => {}} />
          <SettingRow icon="💱" label="Tasa de cambio" value="BCV ~Bs.400" onPress={() => {}} />
          <SettingRow icon="❓" label="Ayuda y soporte" onPress={() => {}} />
          <SettingRow icon="📄" label="Términos de servicio" onPress={() => {}} />
        </View>

        {/* Logout */}
        <View style={styles.card}>
          <SettingRow icon="🚪" label="Cerrar sesión" onPress={handleLogout} danger />
        </View>

        <Text style={styles.version}>LetsGo v1.0.0 · Hecho en Venezuela 🇻🇪</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitials: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
  userName: { ...Typography.headlineMedium, color: Colors.textPrimary, fontWeight: '700' },
  userPhone: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 4 },
  verifiedBadge: {
    marginTop: 8,
    backgroundColor: Colors.mint + '22',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  verifiedText: { ...Typography.labelSmall, color: Colors.mint, fontWeight: '700' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...Typography.labelSmall,
    color: Colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingTop: 14,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  settingIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  settingLabel: { ...Typography.titleMedium, color: Colors.textPrimary, flex: 1 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { ...Typography.bodySmall, color: Colors.textSecondary },
  settingArrow: { fontSize: 18, color: Colors.textDisabled },
  version: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginTop: 8,
  },
});
