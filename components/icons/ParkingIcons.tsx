import React from 'react';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const PagoMovilIcon: React.FC<IconProps> = ({ size = 40, color = '#00D4AA' }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Rect width="40" height="40" rx="12" fill={color} opacity="0.15" />
    <Rect x="12" y="8" width="16" height="24" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <Rect x="16" y="12" width="8" height="2" rx="1" fill={color} />
    <Rect x="16" y="16" width="8" height="2" rx="1" fill={color} />
    <Circle cx="20" cy="26" r="2" fill={color} />
    <Path d="M25 20 L28 20 M28 20 L26 18 M28 20 L26 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ZelleIcon: React.FC<IconProps> = ({ size = 40, color = '#6D1ED4' }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Rect width="40" height="40" rx="12" fill={color} opacity="0.12" />
    <Circle cx="20" cy="20" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M15 15 H25 L15 25 H25" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PayPalIcon: React.FC<IconProps> = ({ size = 40, color = '#003087' }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Rect width="40" height="40" rx="12" fill={color} opacity="0.1" />
    <Path d="M16 12 C16 12 23 11 24 16 C25 21 20 22 18 22 L16.5 28" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <Path d="M19 17 C19 17 26 16 27 21 C28 26 23 27 21 27 L20 33" stroke="#009cde" strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

export const TransferIcon: React.FC<IconProps> = ({ size = 40, color = '#1A2E4A' }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Rect width="40" height="40" rx="12" fill={color} opacity="0.1" />
    <Rect x="10" y="16" width="20" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M10 21 H30" stroke={color} strokeWidth="2" />
    <Rect x="14" y="24" width="4" height="3" rx="1" fill={color} />
    <Path d="M14 10 H26" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M10 13 L14 10 L10 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const BinanceIcon: React.FC<IconProps> = ({ size = 40, color = '#F3BA2F' }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Rect width="40" height="40" rx="12" fill={color} opacity="0.15" />
    <Polygon points="20,10 24,14 20,18 16,14" fill={color} />
    <Polygon points="14,16 18,20 14,24 10,20" fill={color} />
    <Polygon points="26,16 30,20 26,24 22,20" fill={color} />
    <Polygon points="20,22 24,26 20,30 16,26" fill={color} />
    <Rect x="17" y="17" width="6" height="6" transform="rotate(45 20 20)" fill={color} />
  </Svg>
);

export const CarIcon: React.FC<IconProps> = ({ size = 32, color = '#1A2E4A' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path d="M6 14 L9 9 H23 L26 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Rect x="4" y="14" width="24" height="9" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="10" cy="24" r="2.5" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="22" cy="24" r="2.5" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 14 H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const ParkingPinIcon: React.FC<IconProps> = ({ size = 36, color = '#00D4AA' }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <Path d="M18 2 C11.4 2 6 7.4 6 14 C6 22 18 34 18 34 C18 34 30 22 30 14 C30 7.4 24.6 2 18 2Z" fill={color} />
    <Circle cx="18" cy="14" r="7" fill="white" />
    <Path d="M15 10 H19 C21.2 10 23 11.8 23 14 C23 16.2 21.2 18 19 18 H15 V10Z" fill={color} />
    <Rect x="15" y="18" width="2.5" height="4" rx="1" fill={color} />
  </Svg>
);
