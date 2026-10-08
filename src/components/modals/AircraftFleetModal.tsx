import React from 'react';
import { X, Navigation, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { AircraftEntity } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface AircraftFleetModalProps {
  aircraftList: AircraftEntity[];
  onClose: () => void;
  onFollowAircraft: (flightId: string) => void;
}

export const AircraftFleetModal: React.FC<AircraftFleetModalProps> = ({
  aircraftList,
  onClose,
  onFollowAircraft,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Live Aircraft Tracking</h2>
              <p className="text-xs text-slate-400">
                {aircraftList.length} Aircraft simulated in local airspace and apron.
              </p>
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
        <div className="p-6 overflow-y-auto flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 pb-2">
                  <th className="py-2 px-2">Flight</th>
                  <th className="py-2 px-2">Airline</th>
                  <th className="py-2 px-2">Model</th>
                  <th className="py-2 px-2">Gate</th>
                  <th className="py-2 px-2">Current State</th>
                  <th className="py-2 px-2">Turnaround</th>
                  <th className="py-2 px-2 text-right">Director Camera</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {aircraftList.map((ac) => (
                  <tr key={ac.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2 font-mono font-bold text-white">{ac.flightNumber}</td>
                    <td className="py-2.5 px-2 text-slate-300">{ac.airline}</td>
                    <td className="py-2.5 px-2 text-slate-400">{ac.type}</td>
                    <td className="py-2.5 px-2 font-bold text-sky-400">{ac.assignedGate}</td>
                    <td className="py-2.5 px-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        {ac.state.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${Math.round(ac.progressInState)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onFollowAircraft(ac.flightId);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-sky-600/30 hover:bg-sky-600 text-sky-200 hover:text-white rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
