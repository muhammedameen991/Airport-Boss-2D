import React, { useState } from 'react';
import { X, Building, Globe, Check, Lock, DollarSign, Sparkles } from 'lucide-react';
import { CityFacility, WorldHub } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface CityWorldModalProps {
  cityFacilities: CityFacility[];
  worldHubs: WorldHub[];
  cash: number;
  airportLevel: number;
  onClose: () => void;
  onBuildFacility: (facilityId: string) => void;
  onUnlockHub: (hubId: string) => void;
}

export const CityWorldModal: React.FC<CityWorldModalProps> = ({
  cityFacilities,
  worldHubs,
  cash,
  airportLevel,
  onClose,
  onBuildFacility,
  onUnlockHub,
}) => {
  const [tab, setTab] = useState<'city' | 'world'>('city');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Airport City & Global World Map</h2>
              <p className="text-xs text-slate-400">Develop landside commercial infrastructure and connect world hubs.</p>
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

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-slate-950/20 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('city');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'city'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Airport City Facilities
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('world');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'world'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            World Aviation Hubs
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'city' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cityFacilities.map((fac) => {
                const canAfford = cash >= fac.cost;

                return (
                  <div
                    key={fac.id}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-white text-sm">{fac.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            fac.built
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {fac.built ? 'Operational' : 'Available'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{fac.description}</p>
                      <div className="space-y-1 text-xs text-slate-300 py-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Revenue:</span>
                          <span className="font-bold text-emerald-400 tabular-nums">
                            +${fac.dailyIncome.toLocaleString()} / day
                          </span>
                        </div>
                        {fac.passengerBoost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Demand Boost:</span>
                            <span className="font-bold text-sky-400">+{fac.passengerBoost}% Passengers</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={fac.built || !canAfford}
                      onClick={() => {
                        soundManager.playCash();
                        onBuildFacility(fac.id);
                      }}
                      className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        fac.built
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 cursor-default'
                          : canAfford
                          ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {fac.built ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Built & Earning
                        </>
                      ) : canAfford ? (
                        `Construct ($${fac.cost.toLocaleString()})`
                      ) : (
                        'Insufficient Funds'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {worldHubs.map((hub) => {
                const canAfford = cash >= hub.unlockCost;
                const levelReached = airportLevel >= hub.requiredAirportLevel;

                return (
                  <div
                    key={hub.id}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-white text-sm">{hub.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            hub.unlocked
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {hub.unlocked ? 'Connected' : 'Locked'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        {hub.city}, {hub.country} · Traffic Demand: {hub.demandFactor}x
                      </p>
                    </div>

                    <button
                      disabled={hub.unlocked || !canAfford || !levelReached}
                      onClick={() => {
                        soundManager.playCash();
                        onUnlockHub(hub.id);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        hub.unlocked
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 cursor-default'
                          : !levelReached
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {hub.unlocked ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Direct Flight Route Active
                        </>
                      ) : !levelReached ? (
                        `Requires Airport Level ${hub.requiredAirportLevel}`
                      ) : canAfford ? (
                        `Open Air Corridor ($${hub.unlockCost.toLocaleString()})`
                      ) : (
                        'Insufficient Funds'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
