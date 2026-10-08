export type GameMode = 'career' | 'sandbox' | 'challenge';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'heavy_rain' | 'fog' | 'thunderstorm';

export type AircraftType = 'A320' | 'B737' | 'B787' | 'B777F' | 'ATR72' | 'A350';

export type AircraftState =
  | 'APPROACHING'
  | 'LANDING'
  | 'TAXIING'
  | 'WAITING'
  | 'AT_GATE'
  | 'DISEMBARKING'
  | 'CLEANING'
  | 'REFUELING'
  | 'CATERING'
  | 'BOARDING'
  | 'READY'
  | 'PUSHBACK'
  | 'TAXI_TO_RUNWAY'
  | 'TAKING_OFF'
  | 'DEPARTED'
  | 'DIVERTED'
  | 'DELAYED'
  | 'MAINTENANCE';

export type BuildingCategory =
  | 'runways'
  | 'taxiways'
  | 'terminals'
  | 'gates'
  | 'services'
  | 'commercial'
  | 'transport'
  | 'city';

export interface BuildingDef {
  id: string;
  name: string;
  category: BuildingCategory;
  cost: number;
  maintenanceCost: number;
  width: number;
  height: number;
  capacity?: number;
  description: string;
  color: string;
  icon: string;
  requiredLevel: number;
}

export interface PlacedBuilding {
  id: string;
  defId: string;
  name: string;
  category: BuildingCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  gateCode?: string; // e.g. "A1", "A2"
  activeFlightId?: string | null;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  color: string;
  aircraftType: AircraftType;
  origin: string;
  destination: string;
  gate: string;
  passengers: number;
  maxPassengers: number;
  cargoKg: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  status: 'Arriving' | 'On time' | 'Boarding' | 'Departing' | 'Delayed' | 'Loading' | 'Departed';
  currentStep: AircraftState;
  fareRevenue: number;
  airlineFee: number;
  isCargo: boolean;
}

export interface AircraftEntity {
  id: string;
  flightId: string;
  flightNumber: string;
  airline: string;
  color: string;
  type: AircraftType;
  state: AircraftState;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  rotation: number;
  speed: number;
  scale: number;
  altitude: number; // 0 for ground, up to 100 in sky
  assignedGate: string;
  progressInState: number; // 0 to 100%
  serviceProgress: {
    disembark: number;
    cleaning: number;
    refuel: number;
    catering: number;
    boarding: number;
  };
}

export interface PassengerEntity {
  id: string;
  name: string;
  flightNumber: string;
  stage: 'entrance' | 'checkin' | 'security' | 'commercial' | 'gate' | 'boarding' | 'onboard';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  happiness: number; // 0 to 100
  patience: number;
  spentMoney: number;
  assignedGate: string;
}

export interface VehicleEntity {
  id: string;
  type: 'fuel' | 'baggage' | 'catering' | 'pushback' | 'bus' | 'car';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  rotation: number;
  speed: number;
  assignedGate?: string;
  state: 'idle' | 'driving_to_gate' | 'servicing' | 'returning';
  progress: number;
}

export interface StaffDepartment {
  id: string;
  name: string;
  count: number;
  salaryPerHead: number;
  efficiency: number; // 0 - 100%
  icon: string;
  description: string;
}

export interface AirlineContract {
  id: string;
  airline: string;
  flightsPerDay: number;
  payoutPerDay: number;
  requiredReputation: number;
  requiredGates: number;
  active: boolean;
  minOnTimeRate: number;
}

export interface WeatherState {
  current: WeatherType;
  temperatureC: number;
  windSpeedKmh: number;
  windDirection: string;
  visibilityKm: number;
  forecast: {
    day: string;
    weather: WeatherType;
    tempMin: number;
    tempMax: number;
  }[];
}

export interface AirportGameEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'warning' | 'contract' | 'finance' | 'weather';
  actionRequired?: boolean;
  choiceA?: { label: string; action: () => void };
  choiceB?: { label: string; action: () => void };
}

export interface ResearchTech {
  id: string;
  title: string;
  cost: number;
  researchTimeSeconds: number;
  unlocked: boolean;
  researching: boolean;
  progress: number; // 0-100
  category: 'operations' | 'passengers' | 'cargo' | 'automation';
  icon: string;
  effect: string;
  prerequisiteId?: string;
}

export interface CityFacility {
  id: string;
  name: string;
  cost: number;
  dailyIncome: number;
  passengerBoost: number;
  built: boolean;
  icon: string;
  description: string;
}

export interface WorldHub {
  id: string;
  name: string;
  city: string;
  country: string;
  demandFactor: number;
  unlocked: boolean;
  requiredAirportLevel: number;
  unlockCost: number;
  icon: string;
}

export interface AirportFinances {
  cash: number;
  dailyIncome: number;
  dailyExpenses: number;
  netProfit: number;
  breakdown: {
    passengerFees: number;
    airlineFees: number;
    commercialShops: number;
    parkingTransport: number;
    hotelCity: number;
    staffSalaries: number;
    maintenance: number;
    fuelElectricity: number;
  };
  dailyHistory: { day: number; income: number; expenses: number; net: number }[];
}

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  autoSaveInterval: number; // seconds
  highDetailGraphics: boolean;
  weatherParticles: boolean;
  showFps: boolean;
}
