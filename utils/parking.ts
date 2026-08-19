import { ParkingSpot } from '../data/mock';

export const REFUND_WINDOW_MS = 5 * 60 * 1000;

export function formatIntervalLabel(minutes: number): string {
  if (minutes === 1) return 'minuto';
  if (minutes === 60) return 'hora';
  return `${minutes} min`;
}

export function formatIntervalDuration(minutes: number, count = 1): string {
  const total = minutes * count;
  if (total < 60) return `${total} min`;
  const hours = total / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }
  return `${total} min`;
}

export function formatSpotPrice(spot: ParkingSpot): { usd: string; bs: string; short: string } {
  if (spot.billingType === 'one_time') {
    return {
      usd: `$${spot.priceUsd.toFixed(2)}`,
      bs: `Bs.${spot.priceBs.toLocaleString('es-VE')}`,
      short: 'USD',
    };
  }
  const unit = formatIntervalLabel(spot.intervalMinutes ?? 60);
  return {
    usd: `$${spot.priceUsd.toFixed(2)}/${unit}`,
    bs: `Bs.${spot.priceBs.toLocaleString('es-VE')}/${unit}`,
    short: 'USD',
  };
}

export function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? `${h}h` : null,
    `${String(m).padStart(2, '0')}m`,
    `${String(s).padStart(2, '0')}s`,
  ]
    .filter(Boolean)
    .join(' ');
}
