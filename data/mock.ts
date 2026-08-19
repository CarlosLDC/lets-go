export type BillingType = 'one_time' | 'time_range';

export interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  availableSpots: number;
  totalSpots: number;
  billingType: BillingType;
  /** Precio por intervalo (time_range) o tarifa fija (one_time). */
  priceUsd: number;
  priceBs: number;
  /** Duración de cada intervalo cobrado. Solo aplica a time_range. */
  intervalMinutes?: number;
  rating: number;
  distance?: number; // km
  isOpen: boolean;
  openHours: string;
  features: string[];
}

export interface Transaction {
  id: string;
  type: 'recharge' | 'parking' | 'refund';
  amount: number;
  currency: 'USD' | 'VES';
  amountBs?: number;
  description: string;
  paymentMethod?: string;
  parkingSpotName?: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  isDefault: boolean;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  logo?: string;
}

export const MOCK_PARKING_SPOTS: ParkingSpot[] = [
  {
    id: '1',
    name: 'Parqueo Sambil Caracas',
    address: 'Av. Libertador, El Rosal',
    city: 'Caracas',
    latitude: 10.4966,
    longitude: -66.8532,
    availableSpots: 45,
    totalSpots: 200,
    billingType: 'time_range',
    intervalMinutes: 60,
    priceUsd: 0.30,
    priceBs: 120,
    rating: 4.6,
    distance: 0.4,
    isOpen: true,
    openHours: '8:00 AM - 10:00 PM',
    features: ['Techado', 'Vigilancia 24h', 'Acceso discapacitados'],
  },
  {
    id: '2',
    name: 'Parqueo CCCT',
    address: 'Chuao, Caracas',
    city: 'Caracas',
    latitude: 10.4928,
    longitude: -66.8586,
    availableSpots: 12,
    totalSpots: 80,
    billingType: 'time_range',
    intervalMinutes: 15,
    priceUsd: 0.10,
    priceBs: 40,
    rating: 4.3,
    distance: 1.1,
    isOpen: true,
    openHours: '7:00 AM - 11:00 PM',
    features: ['Techado', 'Vigilancia 24h'],
  },
  {
    id: '3',
    name: 'Estacionamiento Chacao',
    address: 'Av. Francisco de Miranda, Chacao',
    city: 'Caracas',
    latitude: 10.5010,
    longitude: -66.8455,
    availableSpots: 28,
    totalSpots: 60,
    billingType: 'one_time',
    priceUsd: 1.50,
    priceBs: 600,
    rating: 3.9,
    distance: 2.3,
    isOpen: true,
    openHours: '6:00 AM - 8:00 PM',
    features: ['Al aire libre'],
  },
  {
    id: '4',
    name: 'Parqueo Líder Valencia',
    address: 'Av. Bolívar Norte, Valencia',
    city: 'Valencia',
    latitude: 10.1641,
    longitude: -68.0052,
    availableSpots: 0,
    totalSpots: 40,
    billingType: 'one_time',
    priceUsd: 2.00,
    priceBs: 800,
    rating: 4.1,
    distance: 0.7,
    isOpen: false,
    openHours: '8:00 AM - 6:00 PM',
    features: ['Techado'],
  },
  {
    id: '5',
    name: 'Parqueo Las Mercedes',
    address: 'Calle Madrid, Las Mercedes',
    city: 'Caracas',
    latitude: 10.4840,
    longitude: -66.8620,
    availableSpots: 7,
    totalSpots: 30,
    billingType: 'time_range',
    intervalMinutes: 1,
    priceUsd: 0.02,
    priceBs: 8,
    rating: 4.8,
    distance: 3.1,
    isOpen: true,
    openHours: '24 horas',
    features: ['Techado', 'Vigilancia 24h', 'Lavado de carros'],
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'recharge',
    amount: 5,
    currency: 'USD',
    amountBs: 2000,
    description: 'Recarga vía Zelle',
    paymentMethod: 'Zelle',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: 't2',
    type: 'parking',
    amount: 0.90,
    currency: 'USD',
    amountBs: 360,
    description: 'Parqueo Sambil Caracas',
    parkingSpotName: 'Parqueo Sambil Caracas',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 't3',
    type: 'recharge',
    amount: 3,
    currency: 'USD',
    amountBs: 1200,
    description: 'Recarga vía Pago Móvil',
    paymentMethod: 'Pago Móvil',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 't4',
    type: 'parking',
    amount: 0.38,
    currency: 'USD',
    amountBs: 152,
    description: 'Parqueo Las Mercedes',
    parkingSpotName: 'Parqueo Las Mercedes',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 't5',
    type: 'recharge',
    amount: 5,
    currency: 'USD',
    amountBs: 2000,
    description: 'Recarga vía Zelle',
    paymentMethod: 'Zelle',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 't6',
    type: 'refund',
    amount: 0.50,
    currency: 'USD',
    amountBs: 200,
    description: 'Reembolso Parqueo CCCT',
    parkingSpotName: 'Parqueo CCCT',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 't7',
    type: 'parking',
    amount: 0.50,
    currency: 'USD',
    amountBs: 200,
    description: 'Parqueo CCCT',
    parkingSpotName: 'Parqueo CCCT',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 't8',
    type: 'parking',
    amount: 0.20,
    currency: 'USD',
    amountBs: 80,
    description: 'Estacionamiento Chacao',
    parkingSpotName: 'Estacionamiento Chacao',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 't9',
    type: 'recharge',
    amount: 10,
    currency: 'USD',
    amountBs: 4000,
    description: 'Recarga vía Transferencia',
    paymentMethod: 'Transferencia Bancaria',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 't10',
    type: 'recharge',
    amount: 2,
    currency: 'USD',
    amountBs: 800,
    description: 'Recarga vía Pago Móvil',
    paymentMethod: 'Pago Móvil',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    status: 'failed',
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    plate: 'AC123BC',
    brand: 'Toyota',
    model: 'Corolla',
    color: 'Blanco',
    isDefault: true,
  },
  {
    id: 'v2',
    plate: 'DC456EF',
    brand: 'Chevrolet',
    model: 'Spark',
    color: 'Rojo',
    isDefault: false,
  },
];

export const VENEZUELAN_BANKS: Bank[] = [
  { id: 'b1', name: 'Banesco', code: '0134' },
  { id: 'b2', name: 'Mercantil', code: '0105' },
  { id: 'b3', name: 'Venezuela (BDV)', code: '0102' },
  { id: 'b4', name: 'BBVA Provincial', code: '0108' },
  { id: 'b5', name: 'BNC', code: '0191' },
  { id: 'b6', name: 'Bancamiga', code: '0172' },
  { id: 'b7', name: 'Bicentenario', code: '0175' },
  { id: 'b8', name: 'Sofitasa', code: '0137' },
  { id: 'b9', name: 'Banplus', code: '0174' },
  { id: 'b10', name: 'Bancaribe', code: '0114' },
];

export const EXCHANGE_RATE_BCV = 400; // Bs. por USD (mock)
