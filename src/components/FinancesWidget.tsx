import React from 'react';
import { DollarSign } from 'lucide-react';
import { AirportFinances } from '../types';

interface FinancesWidgetProps {
  finances: AirportFinances;
  onClickFinances: () => void;
}

export const FinancesWidget: React.FC<FinancesWidgetProps> = ({ finances, onClickFinances }) => {
  return (
    <div
      onClick={onClickFinances}
      className="hidden md:flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl z-20 w-56 text-xs cursor-pointer hover:border-slate-700 transition-all select-none"
    >
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 font-bold text-white">
        <DollarSign className="w-4 h-4 text-emerald-400" />
        <span>Finances</span>
      </div>

      <div className="pt-2 space-y-1.5 font-medium">
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>Daily Income:</span>
          <span className="font-bold text-white tabular-nums">${finances.dailyIncome.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>Daily Expenses:</span>
          <span className="font-bold text-slate-300 tabular-nums">${finances.dailyExpenses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-emerald-400 text-xs font-extrabold pt-0.5 border-t border-slate-800">
          <span>Net Profit:</span>
          <span className="tabular-nums">+${finances.netProfit.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300 text-[11px] pt-0.5">
          <span>Cash Balance:</span>
          <span className="font-bold text-emerald-400 tabular-nums">${finances.cash.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
