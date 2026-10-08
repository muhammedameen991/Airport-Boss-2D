import React, { useState } from 'react';
import { X, Hammer, DollarSign, Wrench, Check } from 'lucide-react';
import { BUILDING_CATALOG } from '../../sim/buildingsData';
import { BuildingCategory, BuildingDef } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface BuildCatalogModalProps {
  cash: number;
  airportLevel: number;
  onClose: () => void;
  onSelectBuildingDef: (def: BuildingDef) => void;
}

const CATEGORIES: { id: BuildingCategory; label: string }[] = [
  { id: 'runways', label: 'Runways' },
  { id: 'taxiways', label: 'Taxiways' },
  { id: 'terminals', label: 'Terminals' },
  { id: 'gates', label: 'Gates' },
  { id: 'services', label: 'Services' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'transport', label: 'Transport' },
  { id: 'city', label: 'City' },
];

export const BuildCatalogModal: React.FC<BuildCatalogModalProps> = ({
  cash,
  airportLevel,
  onClose,
  onSelectBuildingDef,
}) => {
  const [activeCategory, setActiveCategory] = useState<BuildingCategory>('runways');

  const filteredBuildings = BUILDING_CATALOG.filter((b) => b.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Airport Construction Catalog</h2>
              <p className="text-xs text-slate-400">Expand runways, gates, concourses, and commercial venues.</p>
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

        {/* Category Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/20 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playClick();
                setActiveCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Buildings Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBuildings.map((b) => {
            const canAfford = cash >= b.cost;
            const levelUnlocked = airportLevel >= b.requiredLevel;

            return (
              <div
                key={b.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                      {b.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      Lvl {b.requiredLevel}+
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{b.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs py-2 border-t border-slate-700/60 font-medium mb-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold tabular-nums">
                      <DollarSign className="w-3.5 h-3.5" /> ${b.cost.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-[11px] tabular-nums">
                      <Wrench className="w-3 h-3" /> ${b.maintenanceCost}/day
                    </span>
                  </div>

                  <button
                    disabled={!canAfford || !levelUnlocked}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectBuildingDef(b);
                      onClose();
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      !levelUnlocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-800/50 cursor-not-allowed'
                    }`}
                  >
                    {!levelUnlocked ? (
                      `Unlocks at Level ${b.requiredLevel}`
                    ) : canAfford ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Select to Place
                      </>
                    ) : (
                      'Insufficient Funds'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
