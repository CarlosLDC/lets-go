import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ParkingSpot } from '../../data/mock';
import { formatSpotPrice, billingTypeLabel } from '../../utils/parking';

interface ParkingSpotCardProps {
  spot: ParkingSpot;
  onPress: () => void;
  compact?: boolean;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

const AvailabilityBadge: React.FC<{ available: number; total: number }> = ({ available, total }) => {
  const percentage = (available / total) * 100;
  const color =
    percentage === 0 ? Colors.error :
    percentage < 20 ? Colors.warning :
    Colors.success;
  const label =
    available === 0 ? 'Lleno' :
    `${available} libre${available !== 1 ? 's' : ''}`;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

export const ParkingSpotCard: React.FC<ParkingSpotCardProps> = ({
  spot,
  onPress,
  compact = false,
  footer,
  style,
}) => {
  const price = formatSpotPrice(spot);
  return (
    <View style={[styles.card, compact && styles.compact, style]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.top}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{spot.name}</Text>
            {spot.isOpen ? (
              <AvailabilityBadge available={spot.availableSpots} total={spot.totalSpots} />
            ) : (
              <View style={[styles.badge, { backgroundColor: Colors.error + '20' }]}>
                <Text style={[styles.badgeText, { color: Colors.error }]}>Cerrado</Text>
              </View>
            )}
          </View>
          <Text style={styles.address} numberOfLines={1}>{spot.address}</Text>
        </View>

        <View style={styles.bottom}>
          <View style={styles.priceBlock}>
            <Text style={styles.priceUsd}>{price.usd}</Text>
            <Text style={styles.priceBs}>≈ {price.bs}</Text>
          </View>

          {!compact && (
            <View style={styles.meta}>
              <Text style={styles.metaText}>⭐ {spot.rating}</Text>
              {spot.distance !== undefined && (
                <Text style={styles.metaText}>📍 {spot.distance} km</Text>
              )}
            </View>
          )}

          <View style={styles.ratingBlock}>
            <Text style={styles.rating}>⭐ {spot.rating}</Text>
          </View>
        </View>

        {!compact && spot.features.length > 0 && (
          <View style={styles.features}>
            {spot.features.slice(0, 2).map((f, i) => (
              <View key={i} style={styles.featureChip}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {footer ? (
        <>
          <View style={styles.separator} />
          <View>{footer}</View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  compact: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    marginRight: 12,
    width: 220,
  },
  top: { marginBottom: 10 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  name: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  address: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBlock: { gap: 1 },
  priceUsd: {
    ...Typography.titleMedium,
    color: Colors.navy,
    fontWeight: '700',
  },
  priceBs: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    gap: 10,
  },
  metaText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  ratingBlock: {},
  rating: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  features: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  featureChip: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  featureText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.titleToContent,
  },
});
