import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AppButton } from '../../components/ui/AppButton';
import { MOCK_PARKING_SPOTS } from '../../data/mock';
import { useAppStore } from '../../store/useAppStore';
import { billingTypeLabel, formatIntervalDuration, formatSpotPrice } from '../../utils/parking';

export default function ParkingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = MOCK_PARKING_SPOTS.find((s) => s.id === id);
  const { activeSession } = useAppStore();

  if (!spot) return (
    <SafeAreaView style={styles.safe}>
      <Text style={{ padding: 20 }}>Estacionamiento no encontrado</Text>
    </SafeAreaView>
  );

  const availabilityPct = (spot.availableSpots / spot.totalSpots) * 100;
  const availColor =
    availabilityPct === 0 ? Colors.error :
    availabilityPct < 20 ? Colors.warning :
    Colors.success;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        {/* Hero */}
        <LinearGradient
          colors={Gradients.darkHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>🏢</Text>
          <LinearGradient
            colors={['transparent', 'rgba(13, 24, 38, 0.95)']}
            style={styles.heroOverlay}
          >
            <Text style={styles.heroName}>{spot.name}</Text>
            <Text style={styles.heroAddress}>{spot.address} · {spot.city}</Text>
          </LinearGradient>
        </LinearGradient>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatSpotPrice(spot).usd}</Text>
            <Text style={styles.statLabel}>{formatSpotPrice(spot).short}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: availColor }]}>
              {spot.availableSpots}
            </Text>
            <Text style={styles.statLabel}>libres</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>⭐ {spot.rating}</Text>
            <Text style={styles.statLabel}>rating</Text>
          </View>
        </View>

        {/* Open / hours */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{spot.isOpen ? '🟢' : '🔴'}</Text>
            <View>
              <Text style={styles.infoLabel}>{spot.isOpen ? 'Abierto ahora' : 'Cerrado'}</Text>
              <Text style={styles.infoValue}>{spot.openHours}</Text>
            </View>
          </View>
          {spot.distance !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View>
                <Text style={styles.infoLabel}>Distancia</Text>
                <Text style={styles.infoValue}>{spot.distance} km de tu ubicación</Text>
              </View>
            </View>
          )}
        </View>

        {/* Features */}
        {spot.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.featuresGrid}>
              {spot.features.map((f, i) => (
                <View key={i} style={styles.featureChip}>
                  <Text style={styles.featureText}>✓ {f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarifas</Text>
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Tipo de cobro</Text>
              <Text style={styles.pricingValue}>{billingTypeLabel(spot)}</Text>
            </View>
            {spot.billingType === 'one_time' ? (
              <View style={[styles.pricingRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.pricingLabel}>Entrada</Text>
                <Text style={styles.pricingValue}>
                  ${spot.priceUsd.toFixed(2)} / Bs.{spot.priceBs.toLocaleString('es-VE')}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>
                    {formatIntervalDuration(spot.intervalMinutes ?? 60, 1)}
                  </Text>
                  <Text style={styles.pricingValue}>
                    ${spot.priceUsd.toFixed(2)} / Bs.{spot.priceBs.toLocaleString('es-VE')}
                  </Text>
                </View>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>
                    {formatIntervalDuration(spot.intervalMinutes ?? 60, 2)}
                  </Text>
                  <Text style={styles.pricingValue}>
                    ${(spot.priceUsd * 2).toFixed(2)} / Bs.{(spot.priceBs * 2).toLocaleString('es-VE')}
                  </Text>
                </View>
                <View style={[styles.pricingRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.pricingLabel}>
                    {formatIntervalDuration(spot.intervalMinutes ?? 60, 4)}
                  </Text>
                  <Text style={styles.pricingValue}>
                    ${(spot.priceUsd * 4).toFixed(2)} / Bs.{(spot.priceBs * 4).toLocaleString('es-VE')}
                  </Text>
                </View>
              </>
            )}
          </View>
          <Text style={styles.refundNote}>
            Puedes cancelar la reserva en cualquier momento. Si han pasado más de 5 minutos, no se reembolsa el saldo.
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          {activeSession?.spotId === spot.id ? (
            <View style={styles.activeSessionInfo}>
              <Text style={styles.activeSessionText}>✅ Tienes una reserva activa aquí</Text>
              <AppButton
                label="Ver reserva"
                onPress={() => router.push('/(tabs)/parking')}
                variant="outline"
                style={{ marginTop: 12 }}
              />
            </View>
          ) : (
            <AppButton
              label={
                !spot.isOpen
                  ? 'Cerrado'
                  : `Parquear aquí · ${formatSpotPrice(spot).usd}`
              }
              onPress={() =>
                router.push({ pathname: '/(tabs)/parking', params: { spotId: spot.id } })
              }
              variant="primary"
              disabled={!spot.isOpen || spot.availableSpots === 0 || Boolean(activeSession)}
              icon="play"
            />
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },
  backBtn: { padding: 16 },
  backText: { ...Typography.titleMedium, color: Colors.mint },
  hero: {
    marginHorizontal: 16,
    borderRadius: 24,
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  heroEmoji: {
    fontSize: 80,
    position: 'absolute',
    top: 20,
  },
  heroOverlay: {
    width: '100%',
    backgroundColor: 'rgba(26,46,74,0.85)',
    padding: 16,
  },
  heroName: { ...Typography.headlineMedium, color: Colors.white, fontWeight: '700' },
  heroAddress: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { ...Typography.headlineMedium, color: Colors.navy, fontWeight: '700' },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 3 },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: { fontSize: 20, marginTop: 2 },
  infoLabel: { ...Typography.caption, color: Colors.textSecondary },
  infoValue: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '600' },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { ...Typography.headlineMedium, color: Colors.textPrimary, marginBottom: 12 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: {
    backgroundColor: Colors.mint + '20',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featureText: { ...Typography.bodySmall, color: Colors.navy, fontWeight: '600' },
  pricingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pricingLabel: { ...Typography.bodyMedium, color: Colors.textSecondary },
  pricingValue: { ...Typography.titleMedium, color: Colors.navy, fontWeight: '700' },
  refundNote: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  cta: { marginHorizontal: 16, marginTop: 8 },
  activeSessionInfo: {
    backgroundColor: Colors.success + '20',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  activeSessionText: { ...Typography.titleMedium, color: Colors.success, fontWeight: '600' },
});
