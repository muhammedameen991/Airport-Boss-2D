import React from 'react';
import { Star, ArrowUpRight, ArrowDownRight, Hammer, Check } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface BottomBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  dailyIncome: number;
  dailyExpenses: number;
  netProfit: number;
  buildModeActive: boolean;
  onToggleBuildMode: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  level,
  xp,
  xpToNextLevel,
  dailyIncome,
  dailyExpenses,
  netProfit,
  buildModeActive,
  onToggleBuildMode,
}) => {
  const xpPercent = Math.min(100, Math.round((xp / xpToNextLevel) * 100));

  return (
    <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2 shadow-2xl select-none">
      {/* Level & XP Progress */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs md:text-sm">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Level {level}</span>
        </div>
        <div className="w-28 md:w-36 hidden sm:block">
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
            <span>XP</span>
            <span className="tabular-nums">
              {xp} / {xpToNextLevel}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-slate-400 text-[11px]">Daily Income:</span>
          <span className="font-bold text-emerald-400 tabular-nums flex items-center">
            ${dailyIncome.toLocaleString()}
            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-slate-400 text-[11px]">Daily Expenses:</span>
          <span className="font-bold text-rose-400 tabular-nums flex items-center">
            ${dailyExpenses.toLocaleString()}
            <ArrowDownRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-slate-400 text-[11px]">Net Profit:</span>
          <span className="font-extrabold text-emerald-400 tabular-nums flex items-center">
            +${netProfit.toLocaleString()}
            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Build Mode Quick Action */}
      <button
        onClick={() => {
          soundManager.playClick();
          onToggleBuildMode();
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs md:text-sm transition-all shadow-lg ${
          buildModeActive
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
            : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
        }`}
      >
        {buildModeActive ? (
          <>
            <Check className="w-4 h-4" /> Done Building
          </>
        ) : (
          <>
            <Hammer className="w-4 h-4" /> Build Mode
          </>
        )}
      </button>
    </div>
  );
};
