import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { useAppStore } from '../../store/useAppStore';

type MethodType = 'zelle' | 'paypal' | 'binance';

const METHOD_INFO: Record<MethodType, { emoji: string; name: string; address: string; instructions: string }> = {
  zelle: {
    emoji: '💵',
    name: 'Zelle',
    address: 'pagos@letsgo.ve',
    instructions:
      '1. Abre tu app bancaria (Bank of America, Chase, etc.)\n' +
      '2. Envía al correo: pagos@letsgo.ve\n' +
      '3. Monto exacto en USD\n' +
      '4. Memo/nota: LETSGO + tu teléfono',
  },
  paypal: {
    emoji: '🌐',
    name: 'PayPal',
    address: 'pagos@letsgo.ve',
    instructions:
      '1. Abre PayPal y toca "Enviar"\n' +
      '2. Busca: pagos@letsgo.ve\n' +
      '3. Selecciona "Amigos y familiares"\n' +
      '4. Nota: LETSGO + tu teléfono',
  },
  binance: {
    emoji: '🪙',
    name: 'Binance Pay',
    address: 'ID: 123456789',
    instructions:
      '1. Abre Binance Pay\n' +
      '2. Busca por ID: 123456789\n' +
      '3. Envía USDT o BUSD\n' +
      '4. Memo: LETSGO + tu teléfono',
  },
};

export default function ZelleScreen() {
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const amountUsd = parseFloat(amount || '5');
  const [method, setMethod] = useState<MethodType>('zelle');
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const { addBalance, addTransaction } = useAppStore();

  const currentMethod = METHOD_INFO[method];

  const handleConfirm = async () => {
    if (!ref.trim()) {
      Alert.alert('Error', 'Ingresa el número de referencia o confirmación del pago.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    addBalance(amountUsd);
    addTransaction({
      type: 'recharge',
      amount: amountUsd,
      currency: 'USD',
      amountBs: amountUsd * 400,
      description: `Recarga vía ${currentMethod.name}`,
      paymentMethod: currentMethod.name,
      date: new Date(),
      status: 'completed',
    });
    setLoading(false);
    Alert.alert(
      '✅ Pago registrado',
      `Se verificará tu pago en breve y se acreditarán $${amountUsd.toFixed(2)} a tu cuenta.`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/wallet') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Method tabs */}
        <View style={styles.methodTabs}>
          {(['zelle', 'paypal', 'binance'] as MethodType[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.methodTab, method === m && styles.methodTabActive]}
              onPress={() => setMethod(m)}
            >
              <Text style={styles.methodTabEmoji}>{METHOD_INFO[m].emoji}</Text>
              <Text style={[styles.methodTabLabel, method === m && styles.methodTabLabelActive]}>
                {METHOD_INFO[m].name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <LinearGradient
          colors={Gradients.darkCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summary}
        >
          <Text style={styles.summaryLabel}>Enviar</Text>
          <Text style={styles.summaryAmount}>${amountUsd.toFixed(2)}</Text>
          <Text style={styles.summaryTo}>a {currentMethod.address}</Text>
        </LinearGradient>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>{currentMethod.emoji} Instrucciones</Text>
          <Text style={styles.instructionsText}>{currentMethod.instructions}</Text>
        </View>

        {/* Ref input */}
        <TextInput
          label={`Referencia / Confirmación de ${currentMethod.name}`}
          value={ref}
          onChangeText={setRef}
          mode="outlined"
          style={styles.input}
          outlineColor={Colors.border}
          activeOutlineColor={Colors.mint}
          textColor={Colors.textPrimary}
          left={<TextInput.Icon icon="receipt" color={Colors.textSecondary} />}
          placeholder="Número de confirmación"
        />

        <View style={styles.secureNote}>
          <Text style={styles.secureText}>
            🔒 Verificación manual en horario hábil (L-V 8AM-6PM). Fines de semana puede tardar hasta el lunes.
          </Text>
        </View>

        <AppButton
          label={loading ? 'Enviando...' : 'Confirmar pago'}
          onPress={handleConfirm}
          loading={loading}
          variant="primary"
          style={styles.confirmBtn}
        />

        <AppButton label="Cancelar" onPress={() => router.back()} variant="ghost" />
        <View style={{ height: 12 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

import { Spacing } from '../../constants/spacing';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  methodTabs: {
    flexDirection: 'row',
    gap: Spacing.itemGap,
    marginTop: 16,
    marginBottom: 16,
  },
  methodTab: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodTabActive: { borderColor: Colors.mint, backgroundColor: Colors.mintSurface },
  methodTabEmoji: { fontSize: 22, marginBottom: 4 },
  methodTabLabel: { ...Typography.caption, color: Colors.textSecondary },
  methodTabLabelActive: { color: Colors.navy, fontWeight: '700' },
  summary: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryLabel: { ...Typography.labelLarge, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  summaryAmount: { fontSize: 48, fontFamily: 'Inter_700Bold', color: Colors.mint, marginTop: 8 },
  summaryTo: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  instructionsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: Spacing.sectionGap,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.titleToContent },
  instructionsText: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 24 },
  input: { backgroundColor: Colors.white, marginBottom: 14 },
  secureNote: {
    backgroundColor: Colors.mint + '18',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  secureText: { ...Typography.bodySmall, color: Colors.navyLight, lineHeight: 18 },
  confirmBtn: { marginBottom: 12 },
});
