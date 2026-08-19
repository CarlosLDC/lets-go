import { create } from 'zustand';
import { MOCK_TRANSACTIONS, MOCK_VEHICLES, ParkingSpot, Transaction, Vehicle } from '../data/mock';
import { REFUND_WINDOW_MS } from '../utils/parking';

export interface ActiveSession {
  id: string;
  spotId: string;
  spotName: string;
  startTime: Date;
  vehicleId: string;
  vehiclePlate: string;
  billingType: ParkingSpot['billingType'];
  amountPaidUsd: number;
  intervalMinutes?: number;
  pricePerIntervalUsd?: number;
  reservedUntil?: Date;
}

export type ParkingActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

interface AppState {
  // User
  userName: string;
  userPhone: string;
  userCedula: string;
  isAuthenticated: boolean;

  // Balance
  balanceUsd: number;
  balanceBs: number;
  exchangeRate: number;

  // Vehicles
  vehicles: Vehicle[];
  defaultVehicle: Vehicle | null;

  // Transactions
  transactions: Transaction[];

  // Active parking sessions (one per vehicle)
  activeSessions: ActiveSession[];

  // Actions
  login: (phone: string, cedula: string) => void;
  logout: () => void;
  addBalance: (amountUsd: number) => void;
  startParking: (spot: ParkingSpot, intervals?: number, vehicleId?: string) => ParkingActionResult;
  extendParking: (sessionId: string, intervals: number) => ParkingActionResult;
  cancelParking: (sessionId: string) => ParkingActionResult;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Omit<Vehicle, 'id'>>) => void;
  removeVehicle: (id: string) => void;
  setDefaultVehicle: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  userName: 'Carlos Rodríguez',
  userPhone: '0414-123-4567',
  userCedula: 'V-12.345.678',
  isAuthenticated: false,

  balanceUsd: 12.50,
  balanceBs: 5000,
  exchangeRate: 400,

  vehicles: MOCK_VEHICLES,
  defaultVehicle: MOCK_VEHICLES[0],

  transactions: MOCK_TRANSACTIONS,

  activeSessions: [],

  // Actions
  login: (phone, cedula) => set({ isAuthenticated: true, userPhone: phone, userCedula: cedula }),
  logout: () => set({ isAuthenticated: false }),

  addBalance: (amountUsd) => {
    const { exchangeRate } = get();
    set((state) => ({
      balanceUsd: state.balanceUsd + amountUsd,
      balanceBs: state.balanceBs + amountUsd * exchangeRate,
    }));
  },

  startParking: (spot, intervals = 1, vehicleId) => {
    const { activeSessions, vehicles, defaultVehicle, balanceUsd, exchangeRate, addBalance, addTransaction } = get();

    const vehicle =
      (vehicleId ? vehicles.find((v) => v.id === vehicleId) : null) ?? defaultVehicle;

    if (!vehicle) {
      return { ok: false, message: 'Debes registrar al menos un vehículo en tu perfil antes de iniciar un parqueo.' };
    }
    if (activeSessions.some((session) => session.vehicleId === vehicle.id)) {
      return { ok: false, message: 'Este vehículo ya está en un estacionamiento.' };
    }
    if (!spot.isOpen) {
      return { ok: false, message: 'Este estacionamiento está cerrado.' };
    }
    if (spot.availableSpots === 0) {
      return { ok: false, message: 'No hay cupos disponibles.' };
    }

    const count = spot.billingType === 'time_range' ? Math.max(1, intervals) : 1;
    const amountUsd = spot.priceUsd * count;

    if (balanceUsd < amountUsd) {
      return { ok: false, message: `Saldo insuficiente. Necesitas $${amountUsd.toFixed(2)}.` };
    }

    const now = new Date();
    const intervalMinutes = spot.intervalMinutes ?? 60;
    const session: ActiveSession = {
      id: `s${Date.now()}`,
      spotId: spot.id,
      spotName: spot.name,
      startTime: now,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      billingType: spot.billingType,
      amountPaidUsd: amountUsd,
      ...(spot.billingType === 'time_range'
        ? {
            intervalMinutes,
            pricePerIntervalUsd: spot.priceUsd,
            reservedUntil: new Date(now.getTime() + count * intervalMinutes * 60 * 1000),
          }
        : {}),
    };

    addBalance(-amountUsd);
    addTransaction({
      type: 'parking',
      amount: amountUsd,
      currency: 'USD',
      amountBs: Math.round(amountUsd * exchangeRate),
      description: spot.billingType === 'one_time'
        ? `Pago único · ${spot.name}`
        : `Reserva de tiempo · ${spot.name}`,
      parkingSpotName: spot.name,
      date: now,
      status: 'completed',
    });
    set((state) => ({ activeSessions: [session, ...state.activeSessions] }));

    return {
      ok: true,
      message: spot.billingType === 'one_time'
        ? `Pago único de $${amountUsd.toFixed(2)} confirmado.`
        : `Reservaste ${count} intervalo${count !== 1 ? 's' : ''} por $${amountUsd.toFixed(2)}.`,
    };
  },

  extendParking: (sessionId, intervals) => {
    const { activeSessions, balanceUsd, exchangeRate, addBalance, addTransaction } = get();
    const session = activeSessions.find((item) => item.id === sessionId);
    if (!session) {
      return { ok: false, message: 'No hay una reserva activa.' };
    }
    if (session.billingType !== 'time_range' || !session.reservedUntil || !session.intervalMinutes || session.pricePerIntervalUsd === undefined) {
      return { ok: false, message: 'Este parqueo es de pago único y no se puede extender.' };
    }

    const count = Math.max(1, intervals);
    const amountUsd = session.pricePerIntervalUsd * count;
    if (balanceUsd < amountUsd) {
      return { ok: false, message: `Saldo insuficiente. Necesitas $${amountUsd.toFixed(2)}.` };
    }

    const now = new Date();
    const base = session.reservedUntil.getTime() > now.getTime()
      ? session.reservedUntil
      : now;
    const reservedUntil = new Date(base.getTime() + count * session.intervalMinutes * 60 * 1000);

    addBalance(-amountUsd);
    addTransaction({
      type: 'parking',
      amount: amountUsd,
      currency: 'USD',
      amountBs: Math.round(amountUsd * exchangeRate),
      description: `Extensión de tiempo · ${session.spotName}`,
      parkingSpotName: session.spotName,
      date: now,
      status: 'completed',
    });
    set({
      activeSessions: activeSessions.map((item) =>
        item.id === sessionId
          ? { ...item, amountPaidUsd: item.amountPaidUsd + amountUsd, reservedUntil }
          : item
      ),
    });

    return { ok: true, message: `Se agregó tiempo por $${amountUsd.toFixed(2)}.` };
  },

  cancelParking: (sessionId) => {
    const { activeSessions, exchangeRate, addBalance, addTransaction } = get();
    const session = activeSessions.find((item) => item.id === sessionId);
    if (!session) {
      return { ok: false, message: 'No hay una reserva activa.' };
    }

    const elapsedMs = Date.now() - session.startTime.getTime();
    const refundable = elapsedMs <= REFUND_WINDOW_MS;
    const refundUsd = refundable ? session.amountPaidUsd : 0;

    if (refundUsd > 0) {
      addBalance(refundUsd);
      addTransaction({
        type: 'refund',
        amount: refundUsd,
        currency: 'USD',
        amountBs: Math.round(refundUsd * exchangeRate),
        description: `Reembolso · ${session.spotName}`,
        parkingSpotName: session.spotName,
        date: new Date(),
        status: 'completed',
      });
    }

    set({ activeSessions: activeSessions.filter((item) => item.id !== sessionId) });

    return {
      ok: true,
      message: refundable
        ? `Reserva cancelada. Se reembolsaron $${refundUsd.toFixed(2)}.`
        : 'Reserva cancelada. Han pasado más de 5 minutos, no hay reembolso.',
    };
  },

  addTransaction: (tx) => {
    const newTx: Transaction = { ...tx, id: `t${Date.now()}` };
    set((state) => ({ transactions: [newTx, ...state.transactions] }));
  },

  addVehicle: (vehicle) => {
    const newId = `v${Date.now()}`;
    set((state) => {
      const isFirst = state.vehicles.length === 0;
      const shouldBeDefault = isFirst || Boolean(vehicle.isDefault);
      const newVehicle: Vehicle = {
        ...vehicle,
        id: newId,
        isDefault: shouldBeDefault,
      };

      const updatedVehicles = shouldBeDefault
        ? state.vehicles.map((v) => ({ ...v, isDefault: false })).concat(newVehicle)
        : [...state.vehicles, newVehicle];

      return {
        vehicles: updatedVehicles,
        defaultVehicle: shouldBeDefault ? newVehicle : state.defaultVehicle,
      };
    });
  },

  updateVehicle: (id, updated) => {
    set((state) => {
      const willBeDefault = Boolean(updated.isDefault);
      let updatedVehicles = state.vehicles.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            ...updated,
            isDefault: willBeDefault ? true : v.isDefault,
          };
        }
        return willBeDefault ? { ...v, isDefault: false } : v;
      });

      let newDefault = updatedVehicles.find((v) => v.isDefault) || null;
      if (!newDefault && updatedVehicles.length > 0) {
        updatedVehicles = updatedVehicles.map((v, i) => ({
          ...v,
          isDefault: i === 0,
        }));
        newDefault = updatedVehicles[0];
      }

      return {
        vehicles: updatedVehicles,
        defaultVehicle: newDefault,
      };
    });
  },

  removeVehicle: (id) => {
    const busy = get().activeSessions.some((session) => session.vehicleId === id);
    if (busy) return;

    set((state) => {
      const remaining = state.vehicles.filter((v) => v.id !== id);
      if (remaining.length === 0) {
        return {
          vehicles: [],
          defaultVehicle: null,
        };
      }

      // If removed vehicle was the default, set first remaining as default
      const wasDefault = state.defaultVehicle?.id === id || !remaining.some((v) => v.isDefault);
      if (wasDefault) {
        const updatedRemaining = remaining.map((v, index) => ({
          ...v,
          isDefault: index === 0,
        }));
        return {
          vehicles: updatedRemaining,
          defaultVehicle: updatedRemaining[0],
        };
      }

      return {
        vehicles: remaining,
        defaultVehicle: remaining.find((v) => v.isDefault) || remaining[0],
      };
    });
  },

  setDefaultVehicle: (id) => {
    set((state) => {
      const updatedVehicles = state.vehicles.map((v) => ({
        ...v,
        isDefault: v.id === id,
      }));
      const newDefault = updatedVehicles.find((v) => v.id === id) || null;
      return {
        vehicles: updatedVehicles,
        defaultVehicle: newDefault,
      };
    });
  },
}));
