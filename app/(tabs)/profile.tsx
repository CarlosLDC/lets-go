import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { useAppStore } from '../../store/useAppStore';
import { Vehicle } from '../../data/mock';

const QUICK_BRANDS = ['Toyota', 'Chevrolet', 'Ford', 'Chery', 'Hyundai', 'Kia', 'Nissan'];
const QUICK_COLORS = ['Blanco', 'Negro', 'Plata', 'Gris', 'Azul', 'Rojo'];

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
  const {
    userName,
    userPhone,
    userCedula,
    vehicles,
    logout,
    addVehicle,
    removeVehicle,
    setDefaultVehicle,
  } = useAppStore();

  // Add Vehicle Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setBrand('');
    setModel('');
    setPlate('');
    setColor('');
    setIsDefault(vehicles.length === 0);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsDefault(vehicles.length === 0);
    setModalVisible(true);
  };

  const handleSaveVehicle = () => {
    const cleanBrand = brand.trim();
    const cleanModel = model.trim();
    const cleanPlate = plate.trim().toUpperCase();
    const cleanColor = color.trim() || 'No especificado';

    if (!cleanBrand || !cleanModel || !cleanPlate) {
      Alert.alert(
        'Datos requeridos',
        'Por favor completa la marca, modelo y placa del vehículo.'
      );
      return;
    }

    if (cleanPlate.length < 4) {
      Alert.alert('Placa inválida', 'La placa debe tener al menos 4 caracteres.');
      return;
    }

    addVehicle({
      brand: cleanBrand,
      model: cleanModel,
      plate: cleanPlate,
      color: cleanColor,
      isDefault,
    });

    setModalVisible(false);
    resetForm();
    Alert.alert('Vehículo registrado', `El vehículo ${cleanBrand} ${cleanModel} ha sido agregado exitosamente.`);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    Alert.alert(
      'Eliminar vehículo',
      `¿Estás seguro de que deseas eliminar el vehículo ${vehicle.brand} ${vehicle.model} (${vehicle.plate})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            removeVehicle(vehicle.id);
          },
        },
      ]
    );
  };

  const handleSetDefault = (vehicle: Vehicle) => {
    setDefaultVehicle(vehicle.id);
  };

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
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Mis vehículos</Text>
            <Text style={styles.vehicleCountBadge}>{vehicles.length} registrado{vehicles.length !== 1 ? 's' : ''}</Text>
          </View>

          {vehicles.length === 0 ? (
            <View style={styles.emptyVehicles}>
              <Text style={styles.emptyVehiclesEmoji}>🚗</Text>
              <Text style={styles.emptyVehiclesTitle}>No tienes vehículos registrados</Text>
              <Text style={styles.emptyVehiclesSub}>
                Agrega un vehículo para agilizar tu acceso y cobro en los estacionamientos.
              </Text>
            </View>
          ) : (
            vehicles.map((v) => (
              <View key={v.id} style={styles.vehicleItem}>
                <View style={styles.vehicleItemLeft}>
                  <View style={styles.vehicleIconContainer}>
                    <Text style={styles.vehicleEmoji}>🚗</Text>
                  </View>
                  <View style={styles.vehicleInfo}>
                    <View style={styles.vehicleHeaderLine}>
                      <Text style={styles.vehicleName}>
                        {v.brand} {v.model}
                      </Text>
                      {v.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>★ Principal</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.vehicleMetaRow}>
                      <View style={styles.plateBadge}>
                        <Text style={styles.plateText}>{v.plate}</Text>
                      </View>
                      {v.color ? (
                        <Text style={styles.vehicleColorText}>• {v.color}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View style={styles.vehicleActions}>
                  {!v.isDefault && (
                    <TouchableOpacity
                      style={styles.makeDefaultBtn}
                      onPress={() => handleSetDefault(v)}
                      accessibilityLabel="Marcar como principal"
                    >
                      <Text style={styles.makeDefaultText}>Hacer principal</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteVehicleBtn}
                    onPress={() => handleDeleteVehicle(v)}
                    accessibilityLabel="Eliminar vehículo"
                  >
                    <Text style={styles.deleteVehicleIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={styles.addVehicleRow}
            onPress={handleOpenAddModal}
            activeOpacity={0.7}
          >
            <View style={styles.addIconBox}>
              <Text style={styles.addIconText}>＋</Text>
            </View>
            <Text style={styles.addVehicleLabel}>Agregar nuevo vehículo</Text>
          </TouchableOpacity>
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

      {/* Add Vehicle Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Agregar Vehículo</Text>
                <Text style={styles.modalSubtitle}>Ingresa los datos de tu carro o moto</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Quick Brand Selector */}
              <Text style={styles.inputLabel}>Marca</Text>
              <TextInput
                placeholder="Ej: Toyota, Chevrolet, Ford..."
                value={brand}
                onChangeText={setBrand}
                mode="outlined"
                style={styles.modalInput}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.mint}
                textColor={Colors.textPrimary}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {QUICK_BRANDS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      brand.toLowerCase() === item.toLowerCase() && styles.chipSelected,
                    ]}
                    onPress={() => setBrand(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        brand.toLowerCase() === item.toLowerCase() && styles.chipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Model */}
              <Text style={styles.inputLabel}>Modelo</Text>
              <TextInput
                placeholder="Ej: Corolla, Spark, Aveo, Yaris..."
                value={model}
                onChangeText={setModel}
                mode="outlined"
                style={styles.modalInput}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.mint}
                textColor={Colors.textPrimary}
              />

              {/* Plate */}
              <Text style={styles.inputLabel}>Placa</Text>
              <TextInput
                placeholder="Ej: AC123BC"
                value={plate}
                onChangeText={(val) => setPlate(val.toUpperCase())}
                autoCapitalize="characters"
                mode="outlined"
                style={styles.modalInput}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.mint}
                textColor={Colors.textPrimary}
                left={<TextInput.Icon icon="card-bulleted" color={Colors.textSecondary} />}
              />

              {/* Color */}
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput
                placeholder="Ej: Blanco, Negro, Plata..."
                value={color}
                onChangeText={setColor}
                mode="outlined"
                style={styles.modalInput}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.mint}
                textColor={Colors.textPrimary}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {QUICK_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.chip,
                      color.toLowerCase() === c.toLowerCase() && styles.chipSelected,
                    ]}
                    onPress={() => setColor(c)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        color.toLowerCase() === c.toLowerCase() && styles.chipTextSelected,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Set as Default Switch */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.switchTitle}>Vehículo principal</Text>
                  <Text style={styles.switchSubtitle}>
                    Se seleccionará por defecto en tus nuevos parqueos
                  </Text>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: Colors.border, true: Colors.mint }}
                  thumbColor={Colors.white}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <AppButton
                  label="Guardar vehículo"
                  onPress={handleSaveVehicle}
                  variant="primary"
                  style={styles.saveButton}
                />
                <AppButton
                  label="Cancelar"
                  onPress={() => setModalVisible(false)}
                  variant="ghost"
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 8,
  },
  vehicleCountBadge: {
    ...Typography.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  vehicleItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleEmoji: {
    fontSize: 20,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  vehicleName: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: Colors.mintSurface,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.mint + '44',
  },
  defaultBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: Colors.mintDark,
  },
  vehicleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  plateBadge: {
    backgroundColor: Colors.navyDark,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  plateText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  vehicleColorText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  vehicleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  makeDefaultBtn: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  makeDefaultText: {
    ...Typography.caption,
    color: Colors.navy,
    fontWeight: '600',
  },
  deleteVehicleBtn: {
    padding: 8,
    borderRadius: 8,
  },
  deleteVehicleIcon: {
    fontSize: 16,
  },
  emptyVehicles: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
  },
  emptyVehiclesEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  emptyVehiclesTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  emptyVehiclesSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  addVehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  addIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.mintSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconText: {
    fontSize: 16,
    color: Colors.mintDark,
    fontWeight: '700',
    lineHeight: 18,
  },
  addVehicleLabel: {
    ...Typography.titleMedium,
    color: Colors.navy,
    fontWeight: '600',
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  modalSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  modalScroll: {
    flexGrow: 0,
  },
  inputLabel: {
    ...Typography.labelMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Colors.mintSurface,
    borderColor: Colors.mint,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.mintDark,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 14,
  },
  switchTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  switchSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalActions: {
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  saveButton: {
    marginBottom: 4,
  },
});
