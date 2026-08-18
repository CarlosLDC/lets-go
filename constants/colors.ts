export const Colors = {
  // Primary
  navy: '#1A2E4A',
  navyLight: '#243F66',
  navyDark: '#0F1E30',

  // Accent
  mint: '#00D4AA',
  mintLight: '#33DDBB',
  mintDark: '#00A888',
  mintSurface: '#E6FAF5',

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

export const Gradients = {
  // Minimalist dark gradient for primary cards (BalanceCard, SummaryCards, ActiveSession)
  darkCard: ['#223A5E', '#1A2E4A', '#101F33'] as const,
  // Minimalist top-to-bottom dark gradient for Hero headers
  darkHero: ['#1E3454', '#15263D', '#0D1826'] as const,
  // Compact elements & buttons
  darkElement: ['#26436C', '#1A2E4A'] as const,
  // Surface highlight overlay gradient
  darkShimmer: ['#2A4770', '#1A2E4A'] as const,
} as const;

export type ColorKey = keyof typeof Colors;
export type GradientKey = keyof typeof Gradients;
