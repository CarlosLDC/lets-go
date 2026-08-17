import { MD3LightTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { Colors } from './colors';

export const AppTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.mint,
    onPrimary: Colors.navy,
    primaryContainer: Colors.navyLight,
    onPrimaryContainer: Colors.mint,
    secondary: Colors.navy,
    onSecondary: Colors.white,
    secondaryContainer: Colors.navyLight,
    onSecondaryContainer: Colors.white,
    background: Colors.offWhite,
    onBackground: Colors.textPrimary,
    surface: Colors.white,
    onSurface: Colors.textPrimary,
    surfaceVariant: Colors.surfaceVariant,
    onSurfaceVariant: Colors.textSecondary,
    error: Colors.error,
    outline: Colors.border,
  },
};
