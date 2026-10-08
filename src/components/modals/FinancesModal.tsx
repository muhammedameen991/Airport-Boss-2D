import React from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { AirportFinances } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface FinancesModalProps {
  finances: AirportFinances;
  onClose: () => void;
}

export const FinancesModal: React.FC<FinancesModalProps> = ({ finances, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Airport Financial Statement</h2>
              <p className="text-xs text-slate-400">Cash Balance: ${finances.cash.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Daily Revenue
              </span>
              <div className="text-xl font-black text-emerald-400 mt-2 tabular-nums">
                +${finances.dailyIncome.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-400" /> Daily Operating Cost
              </span>
              <div className="text-xl font-black text-rose-400 mt-2 tabular-nums">
                -${finances.dailyExpenses.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-sky-400" /> Net Daily Profit
              </span>
              <div className="text-xl font-black text-white mt-2 tabular-nums">
                +${finances.netProfit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Sources */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <h3 className="font-extrabold text-sm text-white mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Revenue Breakdown
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Passenger Passenger Fees</span>
                  <span className="font-bold text-white tabular-nums">
                    ${finances.breakdown.passengerFees.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Airline Slot Contracts</span>
                  <span className="font-bold text-white tabular-nums">
                    ${finances.breakdown.airlineFees.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Commercial Duty-Free & Cafes</span>
                  <span className="font-bold text-white tabular-nums">
                    ${finances.breakdown.commercialShops.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Parking & Curbside Transit</span>
                  <span className="font-bold text-white tabular-nums">
                    ${finances.breakdown.parkingTransport.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">Transit Hotel Concession</span>
                  <span className="font-bold text-white tabular-nums">
                    ${finances.breakdown.hotelCity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <h3 className="font-extrabold text-sm text-white mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Expenses Breakdown
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Staff Salaries & Benefits</span>
                  <span className="font-bold text-rose-300 tabular-nums">
                    ${finances.breakdown.staffSalaries.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Runway & Facilities Maintenance</span>
                  <span className="font-bold text-rose-300 tabular-nums">
                    ${finances.breakdown.maintenance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">Jet Fuel & Electricity</span>
                  <span className="font-bold text-rose-300 tabular-nums">
                    ${finances.breakdown.fuelElectricity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Daily Ledger */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
            <h3 className="font-extrabold text-sm text-white mb-3">5-Day Ledger Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800 pb-1">
                    <th className="py-1 px-2">Simulation Day</th>
                    <th className="py-1 px-2">Total Revenue</th>
                    <th className="py-1 px-2">Total Expenses</th>
                    <th className="py-1 px-2 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {finances.dailyHistory.map((h) => (
                    <tr key={h.day} className="hover:bg-slate-800/40">
                      <td className="py-2 px-2 text-slate-300 font-bold">Day {h.day}</td>
                      <td className="py-2 px-2 text-emerald-400 tabular-nums">+${h.income.toLocaleString()}</td>
                      <td className="py-2 px-2 text-rose-300 tabular-nums">-${h.expenses.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right font-bold text-white tabular-nums">
                        +${h.net.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
