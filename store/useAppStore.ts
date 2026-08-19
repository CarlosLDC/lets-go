import { create } from 'zustand';
import { MOCK_TRANSACTIONS, MOCK_VEHICLES, Transaction, Vehicle } from '../data/mock';

interface ActiveSession {
  spotId: string;
  spotName: string;
  startTime: Date;
  vehiclePlate: string;
  pricePerHourUsd: number;
}

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

  // Active parking session
  activeSession: ActiveSession | null;

  // Actions
  login: (phone: string, cedula: string) => void;
  logout: () => void;
  addBalance: (amountUsd: number) => void;
  setActiveSession: (session: ActiveSession | null) => void;
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

  activeSession: null,

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

  setActiveSession: (session) => set({ activeSession: session }),

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
