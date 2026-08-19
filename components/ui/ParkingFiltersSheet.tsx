import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { AppButton } from './AppButton';
import type { BillingFilter, DistanceFilter, PriceFilter } from '../../utils/parking';

export type ParkingFilters = {
  city: string;
  billing: BillingFilter;
  openNow: boolean;
  price: PriceFilter;
  distance: DistanceFilter;
};

export const DEFAULT_PARKING_FILTERS: ParkingFilters = {
  city: 'all',
  billing: 'all',
  openNow: false,
  price: 'all',
  distance: 'all',
};

export function countActiveFilters(filters: ParkingFilters): number {
  let count = 0;
  if (filters.city !== 'all') count += 1;
  if (filters.billing !== 'all') count += 1;
  if (filters.openNow) count += 1;
  if (filters.price !== 'all') count += 1;
  if (filters.distance !== 'all') count += 1;
  return count;
}

type Option<T extends string> = { value: T; label: string };

interface ParkingFiltersSheetProps {
  visible: boolean;
  cities: string[];
  value: ParkingFilters;
  onClose: () => void;
  onApply: (filters: ParkingFilters) => void;
}

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.optionRow} onPress={onPress} activeOpacity={0.75}>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

export function ParkingFiltersSheet({
  visible,
  cities,
  value,
  onClose,
  onApply,
}: ParkingFiltersSheetProps) {
  const [draft, setDraft] = useState<ParkingFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const cityOptions: Option<string>[] = useMemo(
    () => [
      { value: 'all', label: 'Todas' },
      ...cities.filter((c) => c !== 'all').map((c) => ({ value: c, label: c })),
    ],
    [cities]
  );

  const billingOptions: Option<BillingFilter>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'one_time', label: 'Tarifa fija' },
    { value: 'time_range', label: 'Por intervalo' },
  ];

  const priceOptions: Option<PriceFilter>[] = [
    { value: 'all', label: 'Cualquier precio' },
    { value: 'lt050', label: 'Hasta $0.50' },
    { value: '050_150', label: '$0.50 – $1.50' },
    { value: 'gt150', label: 'Más de $1.50' },
  ];

  const distanceOptions: Option<DistanceFilter>[] = [
    { value: 'all', label: 'Cualquier distancia' },
    { value: 'lt1', label: 'Menos de 1 km' },
    { value: 'lt3', label: 'Menos de 3 km' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayDismiss} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Filtros</Text>
          <Text style={styles.subtitle}>Ajusta los resultados de estacionamientos disponibles</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ciudad</Text>
              {cityOptions.map((option) => (
                <OptionRow
                  key={option.value}
                  label={option.label}
                  selected={draft.city === option.value}
                  onPress={() => setDraft((prev) => ({ ...prev, city: option.value }))}
                />
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Disponibilidad</Text>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setDraft((prev) => ({ ...prev, openNow: !prev.openNow }))}
                activeOpacity={0.75}
              >
                <View>
                  <Text style={styles.optionLabel}>Solo abiertos ahora</Text>
                  <Text style={styles.optionHint}>Oculta los que están cerrados</Text>
                </View>
                <View style={[styles.toggle, draft.openNow && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, draft.openNow && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de cobro</Text>
              {billingOptions.map((option) => (
                <OptionRow
                  key={option.value}
                  label={option.label}
                  selected={draft.billing === option.value}
                  onPress={() => setDraft((prev) => ({ ...prev, billing: option.value }))}
                />
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Precio</Text>
              {priceOptions.map((option) => (
                <OptionRow
                  key={option.value}
                  label={option.label}
                  selected={draft.price === option.value}
                  onPress={() => setDraft((prev) => ({ ...prev, price: option.value }))}
                />
              ))}
            </View>

            <View style={[styles.section, styles.sectionLast]}>
              <Text style={styles.sectionTitle}>Distancia</Text>
              {distanceOptions.map((option) => (
                <OptionRow
                  key={option.value}
                  label={option.label}
                  selected={draft.distance === option.value}
                  onPress={() => setDraft((prev) => ({ ...prev, distance: option.value }))}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              label="Limpiar"
              onPress={() => setDraft(DEFAULT_PARKING_FILTERS)}
              variant="outline"
              fullWidth={false}
              style={styles.footerBtn}
            />
            <AppButton
              label="Aplicar"
              onPress={() => onApply(draft)}
              variant="primary"
              fullWidth={false}
              style={styles.footerBtnPrimary}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  overlayDismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.offWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  scroll: {
    maxHeight: 460,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 8,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.md,
    paddingBottom: 4,
    marginBottom: Spacing.md,
  },
  sectionLast: {
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.subtitleToSection,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  optionLabel: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: Colors.navy,
  },
  optionHint: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.mint,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mint,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: Colors.mint,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.offWhite,
  },
  footerBtn: {
    flex: 1,
    width: undefined,
  },
  footerBtnPrimary: {
    flex: 1.4,
    width: undefined,
  },
});
