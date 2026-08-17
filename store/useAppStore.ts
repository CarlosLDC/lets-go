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
    const newVehicle: Vehicle = { ...vehicle, id: `v${Date.now()}` };
    set((state) => ({ vehicles: [...state.vehicles, newVehicle] }));
  },

  setDefaultVehicle: (id) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) => ({ ...v, isDefault: v.id === id })),
      defaultVehicle: state.vehicles.find((v) => v.id === id) || null,
    }));
  },
}));
