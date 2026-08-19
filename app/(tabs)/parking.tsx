import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { AppButton } from '../../components/ui/AppButton';
import { ParkingSpotCard } from '../../components/ui/ParkingSpotCard';
import {
  DEFAULT_PARKING_FILTERS,
  ParkingFiltersSheet,
  countActiveFilters,
  type ParkingFilters,
} from '../../components/ui/ParkingFiltersSheet';
import { useAppStore, ActiveSession } from '../../store/useAppStore';
import { MOCK_PARKING_SPOTS, ParkingSpot } from '../../data/mock';
import {
  REFUND_WINDOW_MS,
  formatClock,
  formatIntervalDuration,
  formatIntervalLabel,
  matchesDistanceFilter,
  matchesPriceFilter,
} from '../../utils/parking';

const EXTEND_OPTIONS = [1, 2, 4];
const CITIES = ['all', ...Array.from(new Set(MOCK_PARKING_SPOTS.map((s) => s.city)))];

type ParkingTab = 'available' | 'contracted';

export default function ParkingScreen() {
  const { spotId, view } = useLocalSearchParams<{ spotId?: string; view?: string }>();
  const {
    activeSessions,
    balanceUsd,
    vehicles,
    defaultVehicle,
    startParking,
    extendParking,
    cancelParking,
  } = useAppStore();

  const [tab, setTab] = useState<ParkingTab>('available');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ParkingFilters>(DEFAULT_PARKING_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [intervals, setIntervals] = useState(1);
  const [extendBySession, setExtendBySession] = useState<Record<string, number>>({});
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const busyVehicleIds = useMemo(
    () => new Set(activeSessions.map((session) => session.vehicleId)),
    [activeSessions]
  );
  const freeVehicles = vehicles.filter((v) => !busyVehicleIds.has(v.id));
  const allVehiclesBusy = vehicles.length > 0 && freeVehicles.length === 0;

  useEffect(() => {
    const preferred = freeVehicles.find((v) => v.id === defaultVehicle?.id) ?? freeVehicles[0];
    setSelectedVehicleId((current) => {
      if (current && freeVehicles.some((v) => v.id === current)) return current;
      return preferred?.id ?? null;
    });
  }, [defaultVehicle, vehicles, busyVehicleIds]);

  useEffect(() => {
    if (view === 'contracted') {
      setTab('contracted');
      return;
    }
    if (!spotId) return;
    const match = MOCK_PARKING_SPOTS.find((s) => s.id === spotId);
    if (!match) return;
    if (view === 'book' || !activeSessions.some((session) => session.spotId === spotId)) {
      setTab('available');
      setSelectedSpot(match);
      setIntervals(1);
      return;
    }
    setTab('contracted');
    setSelectedSpot(null);
  }, [spotId, view]);

  useEffect(() => {
    if (activeSessions.length === 0) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeSessions.length]);

  const filteredSpots = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_PARKING_SPOTS.filter((spot) => {
      if (q && !spot.name.toLowerCase().includes(q) && !spot.address.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.city !== 'all' && spot.city !== filters.city) return false;
      if (filters.billing !== 'all' && spot.billingType !== filters.billing) return false;
      if (filters.openNow && !spot.isOpen) return false;
      if (!matchesPriceFilter(spot, filters.price)) return false;
      if (!matchesDistanceFilter(spot, filters.distance)) return false;
      return true;
    });
  }, [search, filters]);

  const startCost = selectedSpot
    ? selectedSpot.billingType === 'one_time'
      ? selectedSpot.priceUsd
      : selectedSpot.priceUsd * intervals
    : 0;

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const handleStart = () => {
    if (!selectedSpot) return;
    if (!selectedVehicleId || !selectedVehicle) {
      Alert.alert(
        'Sin vehículo',
        'Debes registrar al menos un vehículo en tu perfil antes de iniciar un parqueo.',
        [
          { text: 'Ir a perfil', onPress: () => router.push('/(tabs)/profile') },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }
    if (busyVehicleIds.has(selectedVehicleId)) {
      Alert.alert('Vehículo en uso', 'Este vehículo ya está en un estacionamiento.');
      return;
    }

    const timeDetail =
      selectedSpot.billingType === 'time_range'
        ? `\nTiempo: ${formatIntervalDuration(selectedSpot.intervalMinutes ?? 60, intervals)}`
        : '';

    Alert.alert(
      'Confirmar pago',
      `${selectedSpot.name}\nVehículo: ${selectedVehicle.plate}\nTotal: $${startCost.toFixed(2)}${timeDetail}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: () => {
            const result = startParking(
              selectedSpot,
              selectedSpot.billingType === 'time_range' ? intervals : 1,
              selectedVehicleId
            );
            if (!result.ok) {
              Alert.alert('No se pudo iniciar', result.message);
              return;
            }
            setSelectedSpot(null);
            setTab('contracted');
            Alert.alert('Listo', result.message);
          },
        },
      ]
    );
  };

  const handleExtend = (session: ActiveSession) => {
    const count = extendBySession[session.id] ?? 1;
    const cost = (session.pricePerIntervalUsd ?? 0) * count;
    Alert.alert(
      'Confirmar pago',
      `Agregar ${formatIntervalDuration(session.intervalMinutes ?? 60, count)} en ${session.spotName}\nTotal: $${cost.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: () => {
            const result = extendParking(session.id, count);
            if (!result.ok) {
              Alert.alert('No se pudo extender', result.message);
              return;
            }
            Alert.alert('Tiempo agregado', result.message);
          },
        },
      ]
    );
  };

  const handleCancel = (session: ActiveSession) => {
    const elapsedMs = now - session.startTime.getTime();
    const refundable = elapsedMs <= REFUND_WINDOW_MS;
    const refundNote = refundable
      ? `Se reembolsarán $${session.amountPaidUsd.toFixed(2)} a tu saldo.`
      : 'Han pasado más de 5 minutos. No se reembolsará el saldo.';

    Alert.alert('Cancelar reserva', refundNote, [
      { text: 'Seguir', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: () => {
          const result = cancelParking(session.id);
          Alert.alert(result.ok ? 'Listo' : 'Error', result.message);
        },
      },
    ]);
  };

  const activeFilterCount = countActiveFilters(filters);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Parqueo</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'available' && styles.tabSelected]}
            onPress={() => setTab('available')}
          >
            <Text style={[styles.tabLabel, tab === 'available' && styles.tabLabelSelected]}>
              Disponibles
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'contracted' && styles.tabSelected]}
            onPress={() => setTab('contracted')}
          >
            <Text style={[styles.tabLabel, tab === 'contracted' && styles.tabLabelSelected]}>
              Contratados{activeSessions.length > 0 ? ` (${activeSessions.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'available' ? (
          <View>
            {selectedSpot ? (
              <View>
                <TouchableOpacity
                  style={styles.backToList}
                  onPress={() => setSelectedSpot(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backToListText}>← Cambiar estacionamiento</Text>
                </TouchableOpacity>

                <ParkingSpotCard
                  spot={selectedSpot}
                  onPress={() => setSelectedSpot(null)}
                />

                <View style={styles.checkout}>
                  {selectedSpot.billingType === 'time_range' && (
                    <View style={styles.planCard}>
                      <Text style={styles.selectorTitle}>¿Cuánto tiempo reservas?</Text>
                      <View style={styles.intervalRow}>
                        {EXTEND_OPTIONS.map((count) => {
                          const selected = intervals === count;
                          return (
                            <TouchableOpacity
                              key={count}
                              onPress={() => setIntervals(count)}
                              style={[styles.intervalChip, selected && styles.intervalChipSelected]}
                            >
                              <Text style={[styles.intervalChipText, selected && styles.intervalChipTextSelected]}>
                                {formatIntervalDuration(selectedSpot.intervalMinutes ?? 60, count)}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      <Text style={styles.planHint}>
                        ${selectedSpot.priceUsd.toFixed(2)} cada {formatIntervalLabel(selectedSpot.intervalMinutes ?? 60)}.
                        Puedes pagar más tiempo después.
                      </Text>
                    </View>
                  )}

                  <View style={styles.vehicleSelector}>
                    <Text style={styles.selectorTitle}>Vehículo</Text>
                    {vehicles.length === 0 ? (
                      <TouchableOpacity
                        style={styles.emptyVehicle}
                        onPress={() => router.push('/(tabs)/profile')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.emptyVehicleText}>⚠️ Agrega un vehículo en tu perfil</Text>
                      </TouchableOpacity>
                    ) : (
                      vehicles.map((vehicle) => {
                        const busy = busyVehicleIds.has(vehicle.id);
                        const selected = selectedVehicleId === vehicle.id && !busy;
                        return (
                          <TouchableOpacity
                            key={vehicle.id}
                            style={[
                              styles.vehicleOption,
                              selected && styles.vehicleOptionSelected,
                              busy && styles.vehicleOptionBusy,
                            ]}
                            onPress={() => {
                              if (busy) return;
                              setSelectedVehicleId(vehicle.id);
                            }}
                            activeOpacity={busy ? 1 : 0.8}
                            disabled={busy}
                          >
                            <View style={styles.vehicleOptionInfo}>
                              <View style={styles.vehicleNameRow}>
                                <Text style={[styles.vehicleOptionName, busy && styles.vehicleBusyText]}>
                                  {vehicle.brand} {vehicle.model}
                                </Text>
                                {vehicle.isDefault && (
                                  <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultBadgeText}>Principal</Text>
                                  </View>
                                )}
                                {busy && (
                                  <View style={styles.busyBadge}>
                                    <Text style={styles.busyBadgeText}>En uso</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={[styles.vehicleOptionPlate, busy && styles.vehicleBusyText]}>
                                {vehicle.plate}
                              </Text>
                            </View>
                            {selected && <Text style={styles.vehicleCheck}>✓</Text>}
                          </TouchableOpacity>
                        );
                      })
                    )}
                    {allVehiclesBusy && (
                      <Text style={styles.planHint}>
                        Todos tus vehículos están en un estacionamiento. Cancela o espera a que termine el tiempo.
                      </Text>
                    )}
                  </View>

                  <View style={styles.startBlock}>
                    <AppButton
                      label={`Pagar $${startCost.toFixed(2)} e iniciar`}
                      onPress={handleStart}
                      variant="primary"
                      icon="play"
                      disabled={
                        !selectedSpot.isOpen ||
                        selectedSpot.availableSpots === 0 ||
                        balanceUsd < startCost ||
                        !selectedVehicleId ||
                        allVehiclesBusy
                      }
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.searchRow}>
                  <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar estacionamiento..."
                      placeholderTextColor={Colors.textDisabled}
                      value={search}
                      onChangeText={setSearch}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
                    onPress={() => setFiltersOpen(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.filterBtnIcon}>⚙</Text>
                    {activeFilterCount > 0 && (
                      <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.listHeader}>
                  <Text style={styles.listCount}>
                    {filteredSpots.length} resultado{filteredSpots.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                {filteredSpots.length === 0 ? (
                  <View style={styles.empty}>
                    <Text style={styles.emptyTitle}>Sin resultados</Text>
                    <Text style={styles.emptySub}>Prueba con otra búsqueda o quita filtros.</Text>
                  </View>
                ) : (
                  filteredSpots.map((spot) => (
                    <ParkingSpotCard
                      key={spot.id}
                      spot={spot}
                      onPress={() => {
                        setSelectedSpot(spot);
                        setIntervals(1);
                      }}
                    />
                  ))
                )}
              </View>
            )}
          </View>
        ) : (
          <View>
            {activeSessions.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🅿️</Text>
                <Text style={styles.emptyTitle}>No tienes reservas activas</Text>
                <Text style={styles.emptySub}>
                  Contrata un estacionamiento en Disponibles.
                </Text>
              </View>
            ) : (
              activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  now={now}
                  extendCount={extendBySession[session.id] ?? 1}
                  onChangeExtend={(count) =>
                    setExtendBySession((prev) => ({ ...prev, [session.id]: count }))
                  }
                  onExtend={() => handleExtend(session)}
                  onCancel={() => handleCancel(session)}
                />
              ))
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      <ParkingFiltersSheet
        visible={filtersOpen}
        cities={CITIES}
        value={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
        }}
      />
      </SafeAreaView>
  );
}

function SessionCard({
  session,
  now,
  extendCount,
  onChangeExtend,
  onExtend,
  onCancel,
}: {
  session: ActiveSession;
  now: number;
  extendCount: number;
  onChangeExtend: (count: number) => void;
  onExtend: () => void;
  onCancel: () => void;
}) {
  const elapsedMs = now - session.startTime.getTime();
  const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000));
  const remainingMs = session.reservedUntil ? session.reservedUntil.getTime() - now : 0;
  const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
  const timeExpired = session.billingType === 'time_range' && remainingMs <= 0;
  const refundable = elapsedMs <= REFUND_WINDOW_MS;
  const extendCost = (session.pricePerIntervalUsd ?? 0) * extendCount;

  return (
    <LinearGradient
      colors={Gradients.darkCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.activeCard}
    >
      <View style={styles.activeHeader}>
        <View style={[styles.activeDot, timeExpired && styles.activeDotWarn]} />
        <Text style={[styles.activeLabel, timeExpired && styles.activeLabelWarn]}>
          {timeExpired ? 'Tiempo agotado' : 'Reserva activa'}
        </Text>
      </View>

      <Text style={styles.spotName}>{session.spotName}</Text>
      <Text style={styles.plate}>{session.vehiclePlate}</Text>
      {session.billingType === 'time_range' && (
        <Text style={styles.billingHint}>
          ${session.pricePerIntervalUsd?.toFixed(2)} cada{' '}
          {formatIntervalLabel(session.intervalMinutes ?? 60)}
        </Text>
      )}

      <View style={styles.timerBlock}>
        {session.billingType === 'time_range' ? (
          <>
            <Text style={styles.timerLabel}>Tiempo restante</Text>
            <Text style={[styles.timer, timeExpired && styles.timerExpired]}>
              {formatClock(remainingSec)}
            </Text>
            <Text style={styles.costLabel}>Transcurrido {formatClock(elapsedSec)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.timerLabel}>Tiempo transcurrido</Text>
            <Text style={styles.timer}>{formatClock(elapsedSec)}</Text>
          </>
        )}
        <Text style={styles.cost}>${session.amountPaidUsd.toFixed(2)}</Text>
        <Text style={styles.costLabel}>pagado</Text>
      </View>

      {refundable ? (
        <Text style={styles.refundHint}>
          Reembolso disponible si cancelas en los próximos{' '}
          {formatClock(Math.ceil((REFUND_WINDOW_MS - elapsedMs) / 1000))}
        </Text>
      ) : (
        <Text style={styles.noRefundHint}>
          Pasaron 5 minutos: cancelar no reembolsa el saldo
        </Text>
      )}

      {session.billingType === 'time_range' && (
        <View style={styles.extendBlock}>
          <Text style={styles.extendTitle}>Reservar más tiempo</Text>
          <View style={styles.intervalRow}>
            {EXTEND_OPTIONS.map((count) => {
              const selected = extendCount === count;
              return (
                <TouchableOpacity
                  key={count}
                  onPress={() => onChangeExtend(count)}
                  style={[styles.intervalChip, selected && styles.intervalChipSelected]}
                >
                  <Text style={[styles.intervalChipText, selected && styles.intervalChipTextSelected]}>
                    +{formatIntervalDuration(session.intervalMinutes ?? 60, count)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <AppButton
            label={`Pagar $${extendCost.toFixed(2)} más`}
            onPress={onExtend}
            variant="primary"
          />
        </View>
      )}

      <AppButton
        label="Cancelar reserva"
        onPress={onCancel}
        variant="secondary"
        style={styles.stopBtn}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabSelected: { backgroundColor: Colors.white },
  tabLabel: { ...Typography.labelLarge, color: Colors.textSecondary },
  tabLabelSelected: { color: Colors.navy, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  filterBtnActive: {
    backgroundColor: Colors.mintSurface,
  },
  filterBtnIcon: {
    fontSize: 20,
    color: Colors.navy,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    ...Typography.caption,
    color: Colors.navy,
    fontWeight: '700',
    fontSize: 10,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listCount: { ...Typography.bodySmall, color: Colors.textSecondary },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 48,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...Typography.headlineMedium, color: Colors.textPrimary },
  emptySub: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  checkout: {
    marginTop: 8,
    paddingBottom: 8,
  },
  backToList: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backToListText: {
    ...Typography.labelLarge,
    color: Colors.mint,
    fontWeight: '700',
  },
  activeCard: {
    borderRadius: 28,
    margin: 16,
    padding: 24,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mint,
  },
  activeDotWarn: { backgroundColor: Colors.warning },
  activeLabel: {
    ...Typography.labelLarge,
    color: Colors.mint,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activeLabelWarn: { color: Colors.warning },
  spotName: { ...Typography.headlineMedium, color: Colors.white, marginBottom: 4 },
  plate: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.6)' },
  billingHint: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
    marginBottom: 20,
  },
  timerBlock: { alignItems: 'center', marginBottom: 16 },
  timerLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timer: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    letterSpacing: -1,
  },
  timerExpired: { color: Colors.warning },
  cost: {
    ...Typography.headlineLarge,
    color: Colors.mint,
    marginTop: 8,
  },
  costLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  refundHint: {
    ...Typography.bodySmall,
    color: Colors.mint,
    textAlign: 'center',
    marginBottom: 16,
  },
  noRefundHint: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginBottom: 16,
  },
  extendBlock: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  extendTitle: {
    ...Typography.titleMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  stopBtn: { marginTop: 4 },
  selectorTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.titleToContent,
  },
  planCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  planHint: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  intervalRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  intervalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  intervalChipSelected: {
    backgroundColor: Colors.mintSurface,
    borderColor: Colors.mint,
  },
  intervalChipText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  intervalChipTextSelected: {
    color: Colors.mintDark,
    fontWeight: '700',
  },
  vehicleSelector: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  vehicleOptionSelected: {
    borderColor: Colors.mint,
    backgroundColor: Colors.mintSurface,
  },
  vehicleOptionBusy: {
    opacity: 0.55,
  },
  vehicleOptionInfo: { flex: 1 },
  vehicleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  vehicleOptionName: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  vehicleBusyText: { color: Colors.textDisabled },
  defaultBadge: {
    backgroundColor: Colors.navy + '15',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    ...Typography.caption,
    color: Colors.navy,
    fontWeight: '700',
  },
  busyBadge: {
    backgroundColor: Colors.warning + '25',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  busyBadgeText: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '700',
  },
  vehicleOptionPlate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vehicleCheck: {
    ...Typography.titleLarge,
    color: Colors.mintDark,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyVehicle: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  emptyVehicleText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  startBlock: { marginHorizontal: 16, marginTop: 20 },
});
