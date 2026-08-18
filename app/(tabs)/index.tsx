import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { ParkingSpotCard } from '../../components/ui/ParkingSpotCard';
import { BalanceCard } from '../../components/ui/BalanceCard';
import { MOCK_PARKING_SPOTS } from '../../data/mock';
import { useAppStore } from '../../store/useAppStore';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const { balanceUsd, balanceBs, userName } = useAppStore();
  const firstName = userName.split(' ')[0];

  const filtered = MOCK_PARKING_SPOTS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>¿Dónde vas a parquear hoy?</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.notifEmoji}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Balance mini card */}
        <BalanceCard
          balanceUsd={balanceUsd}
          balanceBs={balanceBs}
          onRecharge={() => router.push('/recharge')}
          onHistory={() => router.push('/(tabs)/wallet')}
        />

        {/* Map placeholder */}
        <LinearGradient
          colors={Gradients.darkCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mapPlaceholder}
        >
          <Text style={styles.mapEmoji}>🗺️</Text>
          <Text style={styles.mapText}>Mapa de estacionamientos</Text>
          <Text style={styles.mapSub}>Caracas, Venezuela</Text>
          <View style={styles.mapPin}>
            <Text>📍</Text>
          </View>
        </LinearGradient>

        {/* Search */}
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
          <TouchableOpacity activeOpacity={0.8} style={{ borderRadius: 14, overflow: 'hidden' }}>
            <LinearGradient
              colors={Gradients.darkElement}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.filterBtn}
            >
              <Text style={styles.filterEmoji}>⚙️</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Nearby section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cerca de ti</Text>
          <Text style={styles.sectionCount}>{filtered.length} disponibles</Text>
        </View>

        {filtered.map((spot) => (
          <ParkingSpotCard
            key={spot.id}
            spot={spot}
            onPress={() => router.push({ pathname: '/parking/[id]', params: { id: spot.id } })}
          />
        ))}

        <View style={styles.bottomPad} />
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  subGreeting: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  notifEmoji: { fontSize: 20 },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  mapPlaceholder: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 180,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  mapEmoji: { fontSize: 48, marginBottom: 8 },
  mapText: { ...Typography.titleLarge, color: Colors.white },
  mapSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  mapPin: {
    position: 'absolute',
    top: 24,
    right: 32,
    backgroundColor: Colors.mint,
    borderRadius: 12,
    padding: 6,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterEmoji: { fontSize: 20 },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: { ...Typography.headlineMedium, color: Colors.textPrimary },
  sectionCount: { ...Typography.bodySmall, color: Colors.mint, fontWeight: '600' },
  bottomPad: { height: 24 },
});
