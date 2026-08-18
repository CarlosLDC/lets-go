import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_PARKING_SPOTS } from '../../data/mock';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? `${h}h` : null,
    `${String(m).padStart(2, '0')}m`,
    `${String(s).padStart(2, '0')}s`,
  ]
    .filter(Boolean)
    .join(' ');
}

export default function ParkingScreen() {
  const { activeSession, setActiveSession, balanceUsd, addBalance, addTransaction, defaultVehicle } = useAppStore();
  const [elapsed, setElapsed] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState(MOCK_PARKING_SPOTS[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeSession]);

  const cost = activeSession
    ? (elapsed / 3600) * activeSession.pricePerHourUsd
    : 0;

  const startParking = () => {
    if (balanceUsd < 0.50) {
      Alert.alert('Saldo insuficiente', 'Necesitas al menos $0.50 para iniciar un parqueo.');
      return;
    }
    setActiveSession({
      spotId: selectedSpot.id,
      spotName: selectedSpot.name,
      startTime: new Date(),
      vehiclePlate: defaultVehicle?.plate || 'N/A',
      pricePerHourUsd: selectedSpot.pricePerHourUsd,
    });
  };

  const stopParking = () => {
    if (!activeSession) return;
    const finalCost = Math.max(cost, 0.10);
    Alert.alert(
      'Finalizar parqueo',
      `Duración: ${formatDuration(elapsed)}\nCosto: $${finalCost.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            addBalance(-finalCost);
            addTransaction({
              type: 'parking',
              amount: finalCost,
              currency: 'USD',
              amountBs: Math.round(finalCost * 400),
              description: activeSession.spotName,
              parkingSpotName: activeSession.spotName,
              date: new Date(),
              status: 'completed',
            });
            setActiveSession(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Parqueo</Text>

        {activeSession ? (
          /* ACTIVE SESSION */
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.activeDot} />
              <Text style={styles.activeLabel}>Sesión activa</Text>
            </View>

            <Text style={styles.spotName}>{activeSession.spotName}</Text>
            <Text style={styles.plate}>{activeSession.vehiclePlate}</Text>

            <View style={styles.timerBlock}>
              <Text style={styles.timer}>{formatDuration(elapsed)}</Text>
              <Text style={styles.cost}>${cost.toFixed(3)}</Text>
              <Text style={styles.costLabel}>costo acumulado</Text>
            </View>

            <View style={styles.rateInfo}>
              <Text style={styles.rateText}>
                ${activeSession.pricePerHourUsd}/hora · Bs.{(activeSession.pricePerHourUsd * 400).toFixed(0)}/hora
              </Text>
            </View>

            <AppButton
              label="Detener parqueo"
              onPress={stopParking}
              variant="secondary"
              style={styles.stopBtn}
            />
          </View>
        ) : (
          /* NO SESSION */
          <View>
            <View style={styles.noSession}>
              <Text style={styles.noSessionEmoji}>🅿️</Text>
              <Text style={styles.noSessionTitle}>Sin sesión activa</Text>
              <Text style={styles.noSessionSub}>
                Selecciona un estacionamiento para iniciar
              </Text>
            </View>

            <View style={styles.spotSelector}>
              <Text style={styles.selectorTitle}>Seleccionar estacionamiento</Text>
              {MOCK_PARKING_SPOTS.filter((s) => s.isOpen).map((spot) => (
                <TouchableOpacity
                  key={spot.id}
                  style={[
                    styles.spotOption,
                    selectedSpot.id === spot.id && styles.spotOptionSelected,
                  ]}
                  onPress={() => setSelectedSpot(spot)}
                >
                  <View style={styles.spotOptionInfo}>
                    <Text style={styles.spotOptionName}>{spot.name}</Text>
                    <Text style={styles.spotOptionAddr}>{spot.address}</Text>
                  </View>
                  <Text style={styles.spotOptionPrice}>
                    ${spot.pricePerHourUsd}/h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>Vehículo seleccionado</Text>
              <Text style={styles.vehiclePlate}>
                🚗 {defaultVehicle?.plate} — {defaultVehicle?.brand} {defaultVehicle?.model}
              </Text>
            </View>

            <View style={styles.startBlock}>
              <AppButton
                label="Iniciar parqueo"
                onPress={startParking}
                variant="primary"
                icon="play"
              />
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

import { Spacing } from '../../constants/spacing';

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
    backgroundColor: Colors.navy,
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
  activeLabel: { ...Typography.labelLarge, color: Colors.mint, letterSpacing: 1, textTransform: 'uppercase' },
  spotName: { ...Typography.headlineMedium, color: Colors.white, marginBottom: 4 },
  plate: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.6)', marginBottom: 24 },
  timerBlock: { alignItems: 'center', marginBottom: 16 },
  timer: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    letterSpacing: -1,
  },
  cost: {
    ...Typography.headlineLarge,
    color: Colors.mint,
    marginTop: 8,
  },
  costLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  rateInfo: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
  },
  rateText: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.7)' },
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
  selectorTitle: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.titleToContent },
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
  spotOptionInfo: { flex: 1 },
  spotOptionName: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '600' },
  spotOptionAddr: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  spotOptionPrice: { ...Typography.titleLarge, color: Colors.navy, fontWeight: '700' },
  vehicleInfo: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 14,
    padding: 14,
  },
  vehicleLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  vehiclePlate: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '600' },
  startBlock: { marginHorizontal: 16, marginTop: 20 },
});
