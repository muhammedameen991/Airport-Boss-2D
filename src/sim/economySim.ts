import { AirportFinances, PlacedBuilding, StaffDepartment, AirlineContract } from '../types';

export function calculateDailyFinances(
  buildings: PlacedBuilding[],
  staff: StaffDepartment[],
  contracts: AirlineContract[],
  passengersProcessedToday: number
): { dailyIncome: number; dailyExpenses: number; netProfit: number; breakdown: AirportFinances['breakdown'] } {
  // Income components
  const passengerFees = Math.floor(passengersProcessedToday * 28);
  const activeContracts = contracts.filter((c) => c.active);
  const airlineFees = activeContracts.reduce((sum, c) => sum + c.payoutPerDay, 0);

  // Commercial buildings
  const commercialCount = buildings.filter((b) => b.category === 'commercial').length;
  const commercialShops = commercialCount * 8500 + Math.floor(passengersProcessedToday * 8.5);

  // Parking & transport
  const transportCount = buildings.filter((b) => b.category === 'transport').length;
  const parkingTransport = transportCount * 4200 + Math.floor(passengersProcessedToday * 3.2);

  // Hotel & city
  const cityCount = buildings.filter((b) => b.category === 'city').length;
  const hotelCity = cityCount * 6500;

  const dailyIncome = passengerFees + airlineFees + commercialShops + parkingTransport + hotelCity;

  // Expense components
  const staffSalaries = staff.reduce((sum, s) => sum + s.count * s.salaryPerHead, 0);
  const maintenance = buildings.reduce((sum, b) => sum + 180 * b.level, 0);
  const fuelElectricity = Math.floor(buildings.length * 90 + 3500);

  const dailyExpenses = staffSalaries + maintenance + fuelElectricity;
  const netProfit = dailyIncome - dailyExpenses;

  return {
    dailyIncome,
    dailyExpenses,
    netProfit,
    breakdown: {
      passengerFees,
      airlineFees,
      commercialShops,
      parkingTransport,
      hotelCity,
      staffSalaries,
      maintenance,
      fuelElectricity,
    },
  };
}

export function calculateReputation(
  onTimeCount: number,
  delayedCount: number,
  staffEfficiencyAvg: number,
  facilitiesCount: number
): number {
  const totalFlights = onTimeCount + delayedCount;
  const punctualityScore = totalFlights > 0 ? (onTimeCount / totalFlights) * 40 : 35;
  const efficiencyScore = (staffEfficiencyAvg / 100) * 35;
  const facilityScore = Math.min(25, facilitiesCount * 1.5);

  const reputation = Math.round(punctualityScore + efficiencyScore + facilityScore);
  return Math.max(10, Math.min(100, reputation));
}
