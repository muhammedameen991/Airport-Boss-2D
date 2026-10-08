import React from 'react';
import { X, Luggage, ArrowRight, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface BaggageSystemModalProps {
  onClose: () => void;
}

export const BaggageSystemModal: React.FC<BaggageSystemModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Automated Baggage Handling System</h2>
              <p className="text-xs text-slate-400">High-speed subterranean conveyors & apron baggage tug trailers.</p>
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
          {/* Flow Diagram */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
              Baggage Operational Flow
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 flex-1 w-full">
                <span className="text-xs font-bold text-white block">1. Check-in Desk</span>
                <span className="text-[11px] text-slate-400">Luggage tagged & weighed</span>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-400 shrink-0 transform rotate-90 sm:rotate-0" />
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 flex-1 w-full">
                <span className="text-xs font-bold text-white block">2. Inline 3D CT Scan</span>
                <span className="text-[11px] text-slate-400">Automated explosive detection</span>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-400 shrink-0 transform rotate-90 sm:rotate-0" />
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 flex-1 w-full">
                <span className="text-xs font-bold text-white block">3. Sortation Chute</span>
                <span className="text-[11px] text-slate-400">Laser barcode gate routing</span>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-400 shrink-0 transform rotate-90 sm:rotate-0" />
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 flex-1 w-full">
                <span className="text-xs font-bold text-white block">4. Aircraft Loading</span>
                <span className="text-[11px] text-slate-400">Belt loader into belly hold</span>
              </div>
            </div>
          </div>

          {/* Operational KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Total Bags Processed</span>
              <span className="text-xl font-black text-white mt-1 block">5,840</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Sorting Speed</span>
              <span className="text-xl font-black text-sky-400 mt-1 block">1,200 bags/hr</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Mishandled Rate</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">0.02% (Optimal)</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Baggage Tugs Active</span>
              <span className="text-xl font-black text-amber-400 mt-1 block">8 Vehicles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
