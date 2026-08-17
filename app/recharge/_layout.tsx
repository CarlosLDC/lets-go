import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function RechargeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.offWhite },
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: Colors.textPrimary },
        headerBackTitle: 'Volver',
        headerTintColor: Colors.mint,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Recargar saldo' }} />
      <Stack.Screen name="pago-movil" options={{ title: 'Pago Móvil' }} />
      <Stack.Screen name="transferencia" options={{ title: 'Transferencia bancaria' }} />
      <Stack.Screen name="zelle" options={{ title: 'Zelle / Internacional' }} />
    </Stack>
  );
}
