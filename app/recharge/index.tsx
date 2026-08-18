import React, { useState } from 'react';
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
import { PaymentMethodCard } from '../../components/ui/PaymentMethodCard';
import {
  PagoMovilIcon,
  ZelleIcon,
  PayPalIcon,
  TransferIcon,
  BinanceIcon,
} from '../../components/icons/ParkingIcons';
import { useAppStore } from '../../store/useAppStore';

const AMOUNTS_USD = [1, 2, 5, 10, 20, 50];

export default function RechargeScreen() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5);
  const { balanceUsd } = useAppStore();

  const paymentMethods = [
    {
      icon: <PagoMovilIcon size={44} />,
      title: 'Pago Móvil',
      subtitle: 'Bancamiga, Banesco, BNC y más',
      badge: 'Gratis',
      route: '/recharge/pago-movil',
    },
    {
      icon: <TransferIcon size={44} />,
      title: 'Transferencia Bancaria',
      subtitle: 'Cualquier banco venezolano',
      badge: 'Gratis',
      route: '/recharge/transferencia',
    },
    {
      icon: <ZelleIcon size={44} />,
      title: 'Zelle',
      subtitle: 'Pago en USD desde EE.UU.',
      route: '/recharge/zelle',
    },
    {
      icon: <PayPalIcon size={44} />,
      title: 'PayPal',
      subtitle: 'Pago internacional en USD',
      route: '/recharge/zelle',
    },
    {
      icon: <BinanceIcon size={44} />,
      title: 'Binance Pay',
      subtitle: 'USDT, BTC y otras criptos',
      route: '/recharge/zelle',
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Balance info */}
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Saldo actual</Text>
          <Text style={styles.balanceValue}>${balanceUsd.toFixed(2)} USD</Text>
        </View>

        {/* Amount selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monto a recargar</Text>
          <View style={styles.amountGrid}>
            {AMOUNTS_USD.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountBtn,
                  selectedAmount === amount && styles.amountBtnSelected,
                ]}
                onPress={() => setSelectedAmount(amount)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.amountText,
                    selectedAmount === amount && styles.amountTextSelected,
                  ]}
                >
                  ${amount}
                </Text>
                <Text
                  style={[
                    styles.amountBs,
                    selectedAmount === amount && styles.amountBsSelected,
                  ]}
                >
                  Bs.{(amount * 400).toLocaleString('es-VE')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fee note */}
        {selectedAmount && (
          <View style={styles.feeNote}>
            <Text style={styles.feeText}>
              💡 Recibirás exactamente ${selectedAmount.toFixed(2)} en tu cuenta LetsGo.
              Sin comisiones adicionales para Pago Móvil y Transferencia.
            </Text>
          </View>
        )}

        {/* Payment methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <View style={styles.methodsList}>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.title}
                icon={method.icon}
                title={method.title}
                subtitle={method.subtitle}
                badge={method.badge}
                onPress={() => {
                  if (selectedAmount) {
                    router.push({
                      pathname: method.route as any,
                      params: { amount: selectedAmount.toString() },
                    });
                  }
                }}
                disabled={!selectedAmount}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  balanceInfo: {
    backgroundColor: Colors.navy,
    borderRadius: 20,
    padding: 20,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.65)' },
  balanceValue: { ...Typography.headlineLarge, color: Colors.mint, fontWeight: '700' },
  section: { marginTop: Spacing.sectionGap },
  sectionTitle: { ...Typography.headlineMedium, color: Colors.textPrimary, marginBottom: Spacing.titleToContent },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.itemGap,
  },
  amountBtn: {
    width: '31%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  amountBtnSelected: {
    borderColor: Colors.mint,
    backgroundColor: Colors.mintSurface,
  },
  amountText: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  amountTextSelected: { color: Colors.navy },
  amountBs: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginTop: 3,
  },
  amountBsSelected: { color: Colors.mint },
  feeNote: {
    backgroundColor: Colors.mint + '18',
    borderRadius: 14,
    padding: 14,
    marginTop: Spacing.md,
  },
  feeText: { ...Typography.bodySmall, color: Colors.navyLight, lineHeight: 18 },
  methodsList: { gap: 0 },
});
