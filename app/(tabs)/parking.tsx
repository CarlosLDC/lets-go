import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { AppButton } from '../../components/ui/AppButton';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_PARKING_SPOTS } from '../../data/mock';
import {
  REFUND_WINDOW_MS,
  formatClock,
  formatIntervalDuration,
  formatIntervalLabel,
  formatSpotPrice,
} from '../../utils/parking';

const EXTEND_OPTIONS = [1, 2, 4];

export default function ParkingScreen() {
  const { spotId } = useLocalSearchParams<{ spotId?: string }>();
  const {
    activeSession,
    balanceUsd,
    vehicles,
    defaultVehicle,
    startParking,
    extendParking,
    cancelParking,
  } = useAppStore();

  const openSpots = MOCK_PARKING_SPOTS.filter((s) => s.isOpen);
  const initialSpot =
    openSpots.find((s) => s.id === spotId) ?? openSpots[0] ?? MOCK_PARKING_SPOTS[0];

  const [selectedSpot, setSelectedSpot] = useState(initialSpot);
  const [intervals, setIntervals] = useState(1);
  const [extendCount, setExtendCount] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    defaultVehicle?.id ?? null
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!defaultVehicle) {
      setSelectedVehicleId(null);
      return;
    }
    setSelectedVehicleId((current) => {
      if (current && vehicles.some((v) => v.id === current)) return current;
      return defaultVehicle.id;
    });
  }, [defaultVehicle, vehicles]);

  useEffect(() => {
    if (!spotId) return;
    const match = openSpots.find((s) => s.id === spotId);
    if (match) {
      setSelectedSpot(match);
      setIntervals(1);
    }
  }, [spotId]);

  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const elapsedMs = activeSession ? now - activeSession.startTime.getTime() : 0;
  const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000));
  const remainingMs = activeSession?.reservedUntil
    ? activeSession.reservedUntil.getTime() - now
    : 0;
  const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
  const timeExpired = Boolean(
    activeSession?.billingType === 'time_range' && remainingMs <= 0
  );
  const refundable = elapsedMs <= REFUND_WINDOW_MS;

  const startCost = useMemo(() => {
    if (selectedSpot.billingType === 'one_time') return selectedSpot.priceUsd;
    return selectedSpot.priceUsd * intervals;
  }, [selectedSpot, intervals]);

  const extendCost = activeSession?.pricePerIntervalUsd
    ? activeSession.pricePerIntervalUsd * extendCount
    : 0;

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const handleStart = () => {
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
            Alert.alert('Listo', result.message);
          },
        },
      ]
    );
  };

  const handleExtend = () => {
    if (!activeSession) return;

    Alert.alert(
      'Confirmar pago',
      `Agregar ${formatIntervalDuration(activeSession.intervalMinutes ?? 60, extendCount)} en ${activeSession.spotName}\nTotal: $${extendCost.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: () => {
            const result = extendParking(extendCount);
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

  const handleCancel = () => {
    if (!activeSession) return;
    const refundNote = refundable
      ? `Se reembolsarán $${activeSession.amountPaidUsd.toFixed(2)} a tu saldo.`
      : 'Han pasado más de 5 minutos. No se reembolsará el saldo.';

    Alert.alert('Cancelar reserva', refundNote, [
      { text: 'Seguir', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: () => {
          const result = cancelParking();
          Alert.alert(result.ok ? 'Listo' : 'Error', result.message);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Parqueo</Text>

        {activeSession ? (
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

            <Text style={styles.spotName}>{activeSession.spotName}</Text>
            <Text style={styles.plate}>{activeSession.vehiclePlate}</Text>
            {activeSession.billingType === 'time_range' && (
              <Text style={styles.billingHint}>
                ${activeSession.pricePerIntervalUsd?.toFixed(2)} cada{' '}
                {formatIntervalLabel(activeSession.intervalMinutes ?? 60)}
              </Text>
            )}

            <View style={styles.timerBlock}>
              {activeSession.billingType === 'time_range' ? (
                <>
                  <Text style={styles.timerLabel}>Tiempo restante</Text>
                  <Text style={[styles.timer, timeExpired && styles.timerExpired]}>
                    {formatClock(remainingSec)}
                  </Text>
                  <Text style={styles.costLabel}>
                    Transcurrido {formatClock(elapsedSec)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.timerLabel}>Tiempo transcurrido</Text>
                  <Text style={styles.timer}>{formatClock(elapsedSec)}</Text>
                </>
              )}
              <Text style={styles.cost}>${activeSession.amountPaidUsd.toFixed(2)}</Text>
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

            {activeSession.billingType === 'time_range' && (
              <View style={styles.extendBlock}>
                <Text style={styles.extendTitle}>Reservar más tiempo</Text>
                <View style={styles.intervalRow}>
                  {EXTEND_OPTIONS.map((count) => {
                    const selected = extendCount === count;
                    return (
                      <TouchableOpacity
                        key={count}
                        onPress={() => setExtendCount(count)}
                        style={[styles.intervalChip, selected && styles.intervalChipSelected]}
                      >
                        <Text style={[styles.intervalChipText, selected && styles.intervalChipTextSelected]}>
                          +{formatIntervalDuration(activeSession.intervalMinutes ?? 60, count)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <AppButton
                  label={`Pagar $${extendCost.toFixed(2)} más`}
                  onPress={handleExtend}
                  variant="primary"
                />
              </View>
            )}

            <AppButton
              label="Cancelar reserva"
              onPress={handleCancel}
              variant="secondary"
              style={styles.stopBtn}
            />
          </LinearGradient>
        ) : (
          <View>
            <View style={styles.noSession}>
              <Text style={styles.noSessionEmoji}>🅿️</Text>
              <Text style={styles.noSessionTitle}>Sin reserva activa</Text>
              <Text style={styles.noSessionSub}>
                Selecciona un estacionamiento para iniciar
              </Text>
            </View>

            <View style={styles.spotSelector}>
              <Text style={styles.selectorTitle}>Seleccionar estacionamiento</Text>
              {openSpots.map((spot) => {
                const price = formatSpotPrice(spot);
                const selected = selectedSpot.id === spot.id;
                return (
                  <TouchableOpacity
                    key={spot.id}
                    style={[styles.spotOption, selected && styles.spotOptionSelected]}
                    onPress={() => {
                      setSelectedSpot(spot);
                      setIntervals(1);
                    }}
                  >
                    <View style={styles.spotOptionInfo}>
                      <Text style={styles.spotOptionName}>{spot.name}</Text>
                      <Text style={styles.spotOptionAddr}>{spot.address}</Text>
                    </View>
                    <Text style={styles.spotOptionPrice}>{price.usd}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
                  const selected = selectedVehicleId === vehicle.id;
                  return (
                    <TouchableOpacity
                      key={vehicle.id}
                      style={[styles.vehicleOption, selected && styles.vehicleOptionSelected]}
                      onPress={() => setSelectedVehicleId(vehicle.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.vehicleOptionInfo}>
                        <View style={styles.vehicleNameRow}>
                          <Text style={styles.vehicleOptionName}>
                            {vehicle.brand} {vehicle.model}
                          </Text>
                          {vehicle.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Principal</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.vehicleOptionPlate}>{vehicle.plate}</Text>
                      </View>
                      {selected && <Text style={styles.vehicleCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            <View style={styles.startBlock}>
              <AppButton
                label={`Pagar $${startCost.toFixed(2)} e iniciar`}
                onPress={handleStart}
                variant="primary"
                icon="play"
                disabled={balanceUsd < startCost || !selectedVehicleId}
              />
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 20,
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
  noSession: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  noSessionEmoji: { fontSize: 56 },
  noSessionTitle: { ...Typography.headlineMedium, color: Colors.textPrimary },
  noSessionSub: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
  spotSelector: {
    marginHorizontal: 16,
    gap: 10,
  },
  selectorTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.titleToContent,
  },
  spotOption: {
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
  spotOptionSelected: {
    borderColor: Colors.mint,
    backgroundColor: Colors.mintSurface,
  },
  spotOptionInfo: { flex: 1, paddingRight: 8 },
  spotOptionName: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '600' },
  spotOptionAddr: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  spotOptionPrice: { ...Typography.titleLarge, color: Colors.navy, fontWeight: '700' },
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
