import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { BalanceCard } from '../../components/ui/BalanceCard';
import { TransactionItem } from '../../components/ui/TransactionItem';
import { useAppStore } from '../../store/useAppStore';
import {
  PagoMovilIcon,
  ZelleIcon,
  TransferIcon,
  BinanceIcon,
} from '../../components/icons/ParkingIcons';

export default function WalletScreen() {
  const { balanceUsd, balanceBs, transactions } = useAppStore();

  const rechargeOptions = [
    { label: 'Pago Móvil', icon: <PagoMovilIcon size={36} />, route: '/recharge/pago-movil' },
    { label: 'Zelle', icon: <ZelleIcon size={36} />, route: '/recharge/zelle' },
    { label: 'Transferencia', icon: <TransferIcon size={36} />, route: '/recharge/transferencia' },
    { label: 'Binance Pay', icon: <BinanceIcon size={36} />, route: '/recharge/zelle' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Billetera</Text>
          <TouchableOpacity style={styles.helpBtn}>
            <Text style={styles.helpText}>Ayuda</Text>
          </TouchableOpacity>
        </View>

        <BalanceCard
          balanceUsd={balanceUsd}
          balanceBs={balanceBs}
          onRecharge={() => router.push('/recharge')}
        />

        {/* Quick recharge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recargar con</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {rechargeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.quickCard}
              onPress={() => router.push(opt.route as any)}
              activeOpacity={0.75}
            >
              {opt.icon}
              <Text style={styles.quickLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats bar */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${balanceUsd.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Saldo actual</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {transactions.filter((t) => t.type === 'recharge').length}
            </Text>
            <Text style={styles.statLabel}>Recargas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {transactions.filter((t) => t.type === 'parking').length}
            </Text>
            <Text style={styles.statLabel}>Parqueos</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txList}>
          {transactions.slice(0, 5).map((tx) => (
            <TransactionItem key={tx.id} tx={tx} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  title: { ...Typography.headlineLarge, color: Colors.textPrimary },
  helpBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
  },
  helpText: { ...Typography.labelLarge, color: Colors.textSecondary },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: { ...Typography.headlineMedium, color: Colors.textPrimary },
  seeAll: { ...Typography.labelLarge, color: Colors.mint },
  quickRow: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  quickCard: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  quickLabel: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { ...Typography.headlineLarge, color: Colors.navy },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  txList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});
