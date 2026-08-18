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
import { Spacing } from '../../constants/spacing';
import { BalanceCard } from '../../components/ui/BalanceCard';
import { TransactionItem } from '../../components/ui/TransactionItem';
import { useAppStore } from '../../store/useAppStore';

export default function WalletScreen() {
  const { balanceUsd, balanceBs, transactions } = useAppStore();

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
