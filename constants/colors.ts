export const Colors = {
  // Primary
  navy: '#1A2E4A',
  navyLight: '#243F66',
  navyDark: '#0F1E30',

  // Accent
  mint: '#00D4AA',
  mintLight: '#33DDBB',
  mintDark: '#00A888',

  // Secondary
  coral: '#FF6B6B',
  coralLight: '#FF8E8E',

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF1F6',

  // Text
  textPrimary: '#1A2E4A',
  textSecondary: '#5A6B82',
  textDisabled: '#A0AEBB',
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255,255,255,0.7)',

  // Status
  success: '#00C48C',
  warning: '#FFB800',
  error: '#FF5252',
  info: '#2196F3',

  // Borders
  border: '#DDE3ED',
  borderLight: '#EEF1F6',

  // Overlays
  overlay: 'rgba(26, 46, 74, 0.5)',
  overlayLight: 'rgba(26, 46, 74, 0.15)',
} as const;

export type ColorKey = keyof typeof Colors;
