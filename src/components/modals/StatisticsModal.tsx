import React from 'react';
import { X, BarChart2, Award, CheckCircle, Clock, Users, ShieldAlert } from 'lucide-react';
import { AirportSimState } from '../../sim/airportState';
import { soundManager } from '../../audio/soundManager';

interface StatisticsModalProps {
  state: AirportSimState;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ state, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Airport Analytics & Key Metrics</h2>
              <p className="text-xs text-slate-400">Comprehensive historical performance and airport rating statistics.</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 font-semibold block">On-Time Departure</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">94.8%</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 font-semibold block">Passenger Satisfaction</span>
              <span className="text-2xl font-black text-sky-400 mt-1 block">88 / 100</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 font-semibold block">Total Flights Handled</span>
              <span className="text-2xl font-black text-white mt-1 block">348</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 font-semibold block">Total Revenue Earned</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ${(state.finances.cash + 420000).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <h3 className="font-extrabold text-sm text-white">Achievements & Milestones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">First Flight Safely Landed</h4>
                  <p className="text-slate-400 text-[11px]">Completed maiden commercial flight on Runway 27</p>
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">1,000 Passengers Processed</h4>
                  <p className="text-slate-400 text-[11px]">Smooth concourse check-in without terminal delays</p>
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Profitable Aviation Hub</h4>
                  <p className="text-slate-400 text-[11px]">Maintained positive daily net margins for 5 consecutive days</p>
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Global Megahub Level 5</h4>
                  <p className="text-slate-400 text-[11px]">Connect 5 international destinations (In Progress)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
