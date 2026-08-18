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
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { useAppStore } from '../../store/useAppStore';

const BANK_DATA = {
  name: 'Bancamiga',
  code: '0172',
  rif: 'J-12345678-9',
  account: '0172-0001-00-0000000001',
  accountHolder: 'LetsGo Tech, C.A.',
};

export default function TransferenciaScreen() {
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const amountUsd = parseFloat(amount || '5');
  const amountBs = amountUsd * 400;
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { addBalance, addTransaction } = useAppStore();

  const copyToClipboard = (value: string, label: string) => {
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    addBalance(amountUsd);
    addTransaction({
      type: 'recharge',
      amount: amountUsd,
      currency: 'USD',
      amountBs,
      description: 'Recarga vía Transferencia',
      paymentMethod: 'Transferencia Bancaria',
      date: new Date(),
      status: 'completed',
    });
    setLoading(false);
    Alert.alert(
      '✅ Transferencia registrada',
      'Tu saldo se acreditará en cuanto confirmemos el pago (hasta 30 min hábiles).',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/wallet') }]
    );
  };

  function DataRow({ label, value }: { label: string; value: string }) {
    return (
      <TouchableOpacity style={styles.dataRow} onPress={() => copyToClipboard(value, label)} activeOpacity={0.7}>
        <View style={styles.dataInfo}>
          <Text style={styles.dataLabel}>{label}</Text>
          <Text style={styles.dataValue}>{value}</Text>
        </View>
        <View style={styles.copyBtn}>
          <Text style={styles.copyText}>{copied === label ? '✓' : '📋'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll}>
        <LinearGradient
          colors={Gradients.darkCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summary}
        >
          <Text style={styles.summaryLabel}>Monto a transferir</Text>
          <Text style={styles.summaryAmount}>Bs.{amountBs.toLocaleString('es-VE')}</Text>
          <Text style={styles.summaryUsd}>= ${amountUsd.toFixed(2)} USD</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Datos bancarios destino</Text>
        <View style={styles.bankCard}>
          <DataRow label="Banco" value={BANK_DATA.name} />
          <DataRow label="Código" value={BANK_DATA.code} />
          <DataRow label="RIF" value={BANK_DATA.rif} />
          <DataRow label="Número de cuenta" value={BANK_DATA.account} />
          <DataRow label="Titular" value={BANK_DATA.accountHolder} />
        </View>

        <View style={styles.importantBox}>
          <Text style={styles.importantTitle}>⚠️ Importante</Text>
          <Text style={styles.importantText}>
            • El concepto/referencia debe ser: <Text style={styles.bold}>LETSGO-{Math.floor(Math.random() * 90000 + 10000)}</Text>{`\n`}
            • Transfiere exactamente Bs.{amountBs.toLocaleString('es-VE')}{`\n`}
            • Guarda el comprobante para cualquier reclamo
          </Text>
        </View>

        <AppButton
          label={loading ? 'Registrando...' : 'Ya realicé la transferencia'}
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
  summary: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryLabel: { ...Typography.labelLarge, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  summaryAmount: { fontSize: 40, fontFamily: 'Inter_700Bold', color: Colors.mint, marginTop: 8 },
  summaryUsd: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  sectionTitle: { ...Typography.headlineMedium, color: Colors.textPrimary, marginBottom: Spacing.titleToContent },
  bankCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: Spacing.sectionGap,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dataInfo: { flex: 1 },
  dataLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 2 },
  dataValue: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '600' },
  copyBtn: { width: 32, alignItems: 'center' },
  copyText: { fontSize: 16 },
  importantBox: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 14,
    padding: 16,
    marginBottom: Spacing.sectionGap,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  importantTitle: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.titleToContent },
  importantText: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 22 },
  bold: { fontWeight: '700', color: Colors.textPrimary },
  confirmBtn: { marginBottom: 12 },
});
