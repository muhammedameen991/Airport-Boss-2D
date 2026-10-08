import React from 'react';
import { Play, Pause, FastForward, DollarSign, Users, Plane, Star, BarChart3, Sun, CloudRain } from 'lucide-react';
import { AirportSimState } from '../sim/airportState';
import { soundManager } from '../audio/soundManager';

interface TopHUDProps {
  state: AirportSimState;
  onSpeedChange: (speed: number) => void;
  onOpenTutorial: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({ state, onSpeedChange, onOpenTutorial }) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 py-1.5 md:px-5 md:py-2 flex items-center justify-between shadow-xl z-30 select-none">
      {/* Brand Zone */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Plane className="w-5 h-5 text-white transform -rotate-45" />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-black tracking-tight flex items-center gap-1.5 text-white">
            AIRPORT BOSS 2D
          </h1>
          <p className="text-[10px] md:text-xs text-sky-400 font-medium hidden sm:block">
            Build it. Manage it. Connect the world.
          </p>
        </div>
      </div>

      {/* Main HUD Stats */}
      <div className="flex items-center gap-2 md:gap-5 overflow-x-auto py-1 scrollbar-none">
        {/* Cash Balance */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1 md:px-3 md:py-1.5 shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs md:text-sm font-extrabold text-emerald-400 tabular-nums">
              ${state.finances.cash.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-500 font-semibold tabular-nums hidden sm:block">
              +${state.finances.netProfit.toLocaleString()} / day
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-2.5 py-1 md:px-3 md:py-1.5">
          <Users className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-xs md:text-sm font-bold text-white tabular-nums">
              {state.totalPassengersProcessed.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">Passengers</div>
          </div>
        </div>

        {/* Active Flights */}
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-2.5 py-1 md:px-3 md:py-1.5">
          <Plane className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-xs md:text-sm font-bold text-white tabular-nums">
              {state.flights.length}
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">Active Flights</div>
          </div>
        </div>

        {/* Reputation */}
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-2.5 py-1 md:px-3 md:py-1.5">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <div>
            <div className="text-xs md:text-sm font-bold text-white tabular-nums">
              {state.reputation} / 100
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">Reputation</div>
          </div>
        </div>

        {/* Airport Level */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-1.5">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <div>
            <div className="text-xs md:text-sm font-bold text-indigo-300">
              Level {state.level}
            </div>
            <div className="text-[10px] text-slate-400">{state.levelTitle}</div>
          </div>
        </div>

        {/* Game Clock & Weather */}
        <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-1.5">
          {state.weather.current === 'sunny' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <CloudRain className="w-4 h-4 text-sky-400" />
          )}
          <div>
            <div className="text-xs md:text-sm font-bold text-white tabular-nums flex items-center gap-1.5">
              <span>{state.timeString}</span>
              <span className="text-amber-400 text-[11px]">{state.weather.temperatureC}°C</span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">{state.dayOfWeek}</div>
          </div>
        </div>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-xl p-1 shadow-inner">
        <button
          onClick={() => {
            soundManager.playClick();
            onSpeedChange(0);
          }}
          title="Pause Game"
          className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            state.simSpeed === 0 ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Pause className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            onSpeedChange(1);
          }}
          title="Normal Speed (1x)"
          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
            state.simSpeed === 1 ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            onSpeedChange(2);
          }}
          title="Fast Speed (2x)"
          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
            state.simSpeed === 2 ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          2x
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            onSpeedChange(4);
          }}
          title="Super Fast (4x)"
          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
            state.simSpeed === 4 ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          4x
        </button>
      </div>
    </header>
  );
};
