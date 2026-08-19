import React, { useMemo, useState } from 'react';
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
import { TransactionItem } from '../../components/ui/TransactionItem';
import { useAppStore } from '../../store/useAppStore';
import { Transaction } from '../../data/mock';

type FilterKey = 'all' | Transaction['type'];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'recharge', label: 'Recargas' },
  { key: 'parking', label: 'Parqueos' },
  { key: 'refund', label: 'Reembolsos' },
];

function getGroupLabel(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  if (date >= startOfToday) return 'Hoy';
  if (date >= startOfYesterday) return 'Ayer';
  if (date >= startOfWeek) return 'Esta semana';

  const label = date.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function HistoryScreen() {
  const { transactions } = useAppStore();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    const list = filter === 'all' ? transactions : transactions.filter((tx) => tx.type === filter);
    return [...list].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, filter]);

  const sections = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const title = getGroupLabel(tx.date);
      const group = map.get(title) ?? [];
      group.push(tx);
      map.set(title, group);
    }
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.count}>
          {filtered.length} movimiento{filtered.length !== 1 ? 's' : ''}
        </Text>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => {
            const selected = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setFilter(item.key)}
                activeOpacity={0.8}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {sections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Sin movimientos</Text>
            <Text style={styles.emptySubtitle}>
              No hay transacciones en esta categoría todavía.
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.title}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.txList}>
                {section.data.map((tx, index) => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    isLast={index === section.data.length - 1}
                    onPress={() =>
                      router.push({ pathname: '/history/[id]', params: { id: tx.id } })
                    }
                  />
                ))}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },
  count: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  filters: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.mintSurface,
    borderColor: Colors.mint,
  },
  chipLabel: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  chipLabelSelected: {
    color: Colors.mintDark,
    fontWeight: '700',
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sectionGap,
    paddingBottom: Spacing.subtitleToSection,
  },
  txList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: Spacing.screenPadding,
    paddingHorizontal: Spacing.cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 64,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
