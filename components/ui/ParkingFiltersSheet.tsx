import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
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

function OptionRow<T extends string>({
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
  const sheetRef = useRef<BottomSheetModal>(null);
  const [draft, setDraft] = useState<ParkingFilters>(value);
  const snapPoints = useMemo(() => ['88%'], []);

  useEffect(() => {
    if (visible) {
      setDraft(value);
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  const draftRef = useRef(draft);
  draftRef.current = draft;

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={12}>
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
            onPress={() => onApply(draftRef.current)}
            variant="primary"
            fullWidth={false}
            style={styles.footerBtnPrimary}
          />
        </View>
      </BottomSheetFooter>
    ),
    [onApply]
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheet}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Filtros</Text>
        <Text style={styles.subtitle}>Ajusta los resultados de estacionamientos disponibles</Text>

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
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.offWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: Colors.border,
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 108,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.sectionGap,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.md,
    paddingBottom: 4,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLast: {
    marginBottom: 8,
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
    paddingBottom: 8,
    backgroundColor: Colors.offWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
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
