import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.offWhite },
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: Colors.textPrimary },
        headerBackTitle: 'Volver',
        headerTintColor: Colors.mint,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Historial' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle' }} />
    </Stack>
  );
}
