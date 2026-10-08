import React from 'react';
import { X, Users, Smile, Heart, ShoppingBag, Eye } from 'lucide-react';
import { PassengerEntity } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface PassengerRosterModalProps {
  passengers: PassengerEntity[];
  totalProcessed: number;
  onClose: () => void;
  onFollowPassenger: (passengerId: string) => void;
}

export const PassengerRosterModal: React.FC<PassengerRosterModalProps> = ({
  passengers,
  totalProcessed,
  onClose,
  onFollowPassenger,
}) => {
  const avgHappiness = Math.round(
    passengers.reduce((sum, p) => sum + p.happiness, 0) / (passengers.length || 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Passenger Terminal Roster</h2>
              <p className="text-xs text-slate-400">
                {passengers.length} Active in concourses · Total processed: {totalProcessed.toLocaleString()} · Satisfaction: {avgHappiness}%
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

        {/* List of Simulated Passengers */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {passengers.slice(0, 24).map((p) => {
              return (
                <div
                  key={p.id}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-600 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white text-xs">{p.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 uppercase">
                        {p.stage}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Flight {p.flightNumber}</span>
                      <span>·</span>
                      <span>Gate {p.assignedGate}</span>
                      {p.spentMoney > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold">${p.spentMoney} spent</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        p.happiness > 70 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {p.happiness}%
                    </span>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onFollowPassenger(p.id);
                        onClose();
                      }}
                      title="Follow passenger"
                      className="p-1.5 bg-slate-700/60 hover:bg-sky-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
