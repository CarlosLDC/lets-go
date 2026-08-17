import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { useAppStore } from '../../store/useAppStore';
import { VENEZUELAN_BANKS } from '../../data/mock';
import { TouchableOpacity } from 'react-native';

export default function PagoMovilScreen() {
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const amountUsd = parseFloat(amount || '5');
  const amountBs = amountUsd * 400;

  const [selectedBank, setSelectedBank] = useState(VENEZUELAN_BANKS[0]);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { addBalance, addTransaction } = useAppStore();

  const handleConfirm = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Ingresa el número de teléfono del pago móvil.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    addBalance(amountUsd);
    addTransaction({
      type: 'recharge',
      amount: amountUsd,
      currency: 'USD',
      amountBs,
      description: 'Recarga vía Pago Móvil',
      paymentMethod: 'Pago Móvil',
      date: new Date(),
      status: 'completed',
    });
    setLoading(false);
    Alert.alert(
      '✅ Recarga exitosa',
      `Se acreditaron $${amountUsd.toFixed(2)} a tu cuenta.`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/wallet') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Vas a recargar</Text>
          <Text style={styles.summaryAmount}>${amountUsd.toFixed(2)}</Text>
          <Text style={styles.summaryBs}>≈ Bs.{amountBs.toLocaleString('es-VE')}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📲 Instrucciones</Text>
          <Text style={styles.instructionsText}>
            1. Abre tu app bancaria y selecciona Pago Móvil{`\n`}
            2. Ingresa el número destino: <Text style={styles.bold}>0414-000-0000</Text>{`\n`}
            3. Banco destino: <Text style={styles.bold}>Bancamiga (0172)</Text>{`\n`}
            4. Monto: <Text style={styles.bold}>Bs.{amountBs.toLocaleString('es-VE')}</Text>{`\n`}
            5. Concepto: <Text style={styles.bold}>LETSGO-RECARGA</Text>
          </Text>
        </View>

        {/* Form */}
        <Text style={styles.formTitle}>Confirmar datos del pago</Text>

        {/* Bank selector */}
        <TouchableOpacity
          style={styles.bankSelector}
          onPress={() => setShowBankPicker(!showBankPicker)}
        >
          <Text style={styles.bankSelectorLabel}>Banco que usaste</Text>
          <View style={styles.bankSelectorValue}>
            <Text style={styles.bankName}>{selectedBank.name} ({selectedBank.code})</Text>
            <Text style={styles.bankArrow}>{showBankPicker ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {showBankPicker && (
          <View style={styles.bankList}>
            {VENEZUELAN_BANKS.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[
                  styles.bankItem,
                  selectedBank.id === bank.id && styles.bankItemSelected,
                ]}
                onPress={() => {
                  setSelectedBank(bank);
                  setShowBankPicker(false);
                }}
              >
                <Text style={styles.bankItemText}>
                  {bank.name} ({bank.code})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TextInput
          label="Teléfono origen del pago"
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

        <View style={styles.secureNote}>
          <Text style={styles.secureText}>
            🔒 Tu pago será verificado en menos de 5 minutos hábiles.
          </Text>
        </View>

        <AppButton
          label={loading ? 'Procesando...' : 'Confirmar recarga'}
          onPress={handleConfirm}
          loading={loading}
          variant="primary"
          style={styles.confirmBtn}
        />

        <AppButton
          label="Cancelar"
          onPress={() => router.back()}
          variant="ghost"
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1, paddingHorizontal: 16 },
  summary: {
    backgroundColor: Colors.navy,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  summaryLabel: { ...Typography.labelLarge, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  summaryAmount: { fontSize: 48, fontFamily: 'Inter_700Bold', color: Colors.mint, marginTop: 8 },
  summaryBs: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  instructionsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700', marginBottom: 10 },
  instructionsText: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 22 },
  bold: { fontWeight: '700', color: Colors.textPrimary },
  formTitle: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700', marginBottom: 14 },
  bankSelector: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 14,
  },
  bankSelectorLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  bankSelectorValue: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankName: { ...Typography.titleMedium, color: Colors.textPrimary },
  bankArrow: { color: Colors.textSecondary, fontSize: 12 },
  bankList: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  bankItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bankItemSelected: { backgroundColor: Colors.mint + '18' },
  bankItemText: { ...Typography.bodyMedium, color: Colors.textPrimary },
  input: { backgroundColor: Colors.white, marginBottom: 14 },
  secureNote: {
    backgroundColor: Colors.mint + '18',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  secureText: { ...Typography.bodySmall, color: Colors.navyLight, lineHeight: 18 },
  confirmBtn: { marginBottom: 12 },
});
