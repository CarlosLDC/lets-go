import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Transaction } from '../../data/mock';

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
}

const txIcons: Record<Transaction['type'], string> = {
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

interface TransactionItemProps {
  tx: Transaction;
  onPress?: () => void;
  isLast?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  onPress,
  isLast = false,
}) => {
  const isIncome = tx.type === 'recharge' || tx.type === 'refund';

  const content = (
    <>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{txIcons[tx.type]}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>{tx.description}</Text>
        <Text style={styles.date}>{formatDate(tx.date)}</Text>
      </View>
      <View style={styles.amountBlock}>
        <Text style={[styles.amount, { color: isIncome ? Colors.success : Colors.textPrimary }]}>
          {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
        </Text>
        {tx.status !== 'completed' ? (
          <Text style={[styles.status, { color: statusColor[tx.status] }]}>
            {statusLabel[tx.status]}
          </Text>
        ) : tx.amountBs ? (
          <Text style={styles.amountBs}>
            {isIncome ? '+' : '-'}Bs.{tx.amountBs.toLocaleString('es-VE')}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.row, isLast && styles.rowLast]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.row, isLast && styles.rowLast]}>{content}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  status: {
    ...Typography.caption,
    fontWeight: '700',
    marginTop: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 18 },
  info: { flex: 1 },
  description: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  date: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  amountBlock: { alignItems: 'flex-end' },
  amount: {
    ...Typography.titleMedium,
    fontWeight: '700',
  },
  amountBs: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
