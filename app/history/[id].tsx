import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../store/useAppStore';
import { Transaction } from '../../data/mock';

const typeLabel: Record<Transaction['type'], string> = {
  recharge: 'Recarga',
  parking: 'Parqueo',
  refund: 'Reembolso',
};

const typeIcon: Record<Transaction['type'], string> = {
  recharge: '⬆️',
  parking: '🅿️',
  refund: '↩️',
};

const statusLabel: Record<Transaction['status'], string> = {
  completed: 'Completado',
  pending: 'Pendiente',
  failed: 'Fallido',
};

const statusColor: Record<Transaction['status'], string> = {
  completed: Colors.success,
  pending: Colors.warning,
  failed: Colors.error,
};

function formatFullDate(date: Date): string {
  return date.toLocaleString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tx = useAppStore((s) => s.transactions.find((item) => item.id === id));

  if (!tx) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Movimiento no encontrado</Text>
          <Text style={styles.missingSubtitle}>
            Esta transacción ya no está disponible en tu historial.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = tx.type === 'recharge' || tx.type === 'refund';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={Gradients.darkCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroIcon}>{typeIcon[tx.type]}</Text>
          <Text style={styles.heroType}>{typeLabel[tx.type]}</Text>
          <Text style={[styles.heroAmount, isIncome && styles.heroAmountIncome]}>
            {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
          </Text>
          {tx.amountBs !== undefined && (
            <Text style={styles.heroBs}>
              {isIncome ? '+' : '-'}Bs.{tx.amountBs.toLocaleString('es-VE')}
            </Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColor[tx.status] + '33' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor[tx.status] }]} />
            <Text style={[styles.statusText, { color: statusColor[tx.status] }]}>
              {statusLabel[tx.status]}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalles</Text>
          <DetailRow label="Descripción" value={tx.description} />
          <DetailRow label="Fecha" value={formatFullDate(tx.date)} />
          <DetailRow label="Tipo" value={typeLabel[tx.type]} />
          <DetailRow label="Moneda" value={tx.currency} />
          {tx.paymentMethod ? (
            <DetailRow label="Método de pago" value={tx.paymentMethod} />
          ) : null}
          {tx.parkingSpotName ? (
            <DetailRow label="Estacionamiento" value={tx.parkingSpotName} />
          ) : null}
          <DetailRow label="Referencia" value={tx.id.toUpperCase()} />
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Estado</Text>
            <Text style={[styles.detailValue, { color: statusColor[tx.status] }]}>
              {statusLabel[tx.status]}
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  missingTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
  },
  missingSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  hero: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIcon: { fontSize: 32, marginBottom: 8 },
  heroType: {
    ...Typography.labelLarge,
    color: Colors.textOnDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroAmount: {
    ...Typography.displayLarge,
    color: Colors.white,
    marginTop: 8,
  },
  heroAmountIncome: {
    color: Colors.mint,
  },
  heroBs: {
    ...Typography.bodyMedium,
    color: Colors.textOnDarkSecondary,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.labelLarge,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.sectionGap,
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
