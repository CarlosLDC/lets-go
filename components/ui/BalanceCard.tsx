import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from './AppButton';

interface BalanceCardProps {
  balanceUsd: number;
  balanceBs: number;
  onRecharge: () => void;
  onHistory?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balanceUsd,
  balanceBs,
  onRecharge,
  onHistory,
}) => {
  return (
    <LinearGradient
      colors={Gradients.darkCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.label}>Saldo disponible</Text>
        <View style={styles.dot} />
      </View>

      <View style={styles.balances}>
        <View style={styles.primaryBalance}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.balanceAmount}>{balanceUsd.toFixed(2)}</Text>
          <Text style={styles.currencyLabel}>USD</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.secondaryBalance}>
          <Text style={styles.bsAmount}>{balanceBs.toLocaleString('es-VE')} Bs.D</Text>
          <Text style={styles.rateLabel}>Tasa BCV ~Bs.400/USD</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Recargar"
          onPress={onRecharge}
          variant="primary"
          icon="plus"
          style={styles.rechargeBtn}
        />
        {onHistory && (
          <AppButton
            label="Historial"
            onPress={onHistory}
            variant="ghost"
            style={styles.historyBtn}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.textOnDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mint,
  },
  balances: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  primaryBalance: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    flex: 1,
  },
  currencySymbol: {
    ...Typography.headlineMedium,
    color: Colors.mint,
    marginBottom: 4,
  },
  balanceAmount: {
    ...Typography.displayLarge,
    color: Colors.white,
  },
  currencyLabel: {
    ...Typography.labelSmall,
    color: Colors.textOnDarkSecondary,
    marginBottom: 6,
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  secondaryBalance: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bsAmount: {
    ...Typography.titleLarge,
    color: Colors.textOnDark,
  },
  rateLabel: {
    ...Typography.caption,
    color: Colors.textOnDarkSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  rechargeBtn: {
    flex: 2,
    width: undefined,
  },
  historyBtn: {
    flex: 1,
    width: undefined,
  },
});
