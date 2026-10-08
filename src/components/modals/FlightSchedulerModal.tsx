import React, { useState } from 'react';
import { X, Plane, FileText, Check, PlusCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { Flight, AirlineContract } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface FlightSchedulerModalProps {
  flights: Flight[];
  contracts: AirlineContract[];
  reputation: number;
  onClose: () => void;
  onToggleContract: (contractId: string) => void;
  onAddFlight: (flight: Flight) => void;
  onCancelFlight: (flightId: string) => void;
}

export const FlightSchedulerModal: React.FC<FlightSchedulerModalProps> = ({
  flights,
  contracts,
  reputation,
  onClose,
  onToggleContract,
  onAddFlight,
  onCancelFlight,
}) => {
  const [tab, setTab] = useState<'schedule' | 'contracts'>('schedule');

  const handleQuickAddFlight = () => {
    soundManager.playCash();
    const flightNums = ['SW304', 'SG882', '6E551', 'UK910', 'SW442'];
    const origins = ['Goa', 'Ahmedabad', 'Pune', 'Kolkata', 'Hyderabad'];
    const dests = ['Cochin', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
    const gates = ['A1', 'A2', 'A3', 'A4'];

    const chosenNum = flightNums[Math.floor(Math.random() * flightNums.length)] + Math.floor(Math.random() * 90);
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const dest = dests[Math.floor(Math.random() * dests.length)];
    const gate = gates[Math.floor(Math.random() * gates.length)];

    const newFlight: Flight = {
      id: 'fl_' + Math.random().toString(36).substring(2, 9),
      flightNumber: chosenNum,
      airline: 'SkyWays',
      airlineCode: 'SW',
      color: '#0284c7',
      aircraftType: 'A320',
      origin,
      destination: dest,
      gate,
      passengers: 140,
      maxPassengers: 150,
      cargoKg: 2200,
      scheduledArrival: '16:45',
      scheduledDeparture: '18:10',
      status: 'On time',
      currentStep: 'APPROACHING',
      fareRevenue: 30000,
      airlineFee: 6500,
      isCargo: false,
    };
    onAddFlight(newFlight);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Flight Operations & Contracts</h2>
              <p className="text-xs text-slate-400">Manage daily flight slots, gate allocations, and airline partnerships.</p>
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

        {/* Tab Bar */}
        <div className="px-6 py-2.5 bg-slate-950/20 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setTab('schedule');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'schedule'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Flight Schedule ({flights.length})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setTab('contracts');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'contracts'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Airline Contracts ({contracts.filter((c) => c.active).length} Active)
            </button>
          </div>

          {tab === 'schedule' && (
            <button
              onClick={handleQuickAddFlight}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Schedule New Flight
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'schedule' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 pb-2">
                    <th className="py-2 px-2">Flight #</th>
                    <th className="py-2 px-2">Airline</th>
                    <th className="py-2 px-2">Route</th>
                    <th className="py-2 px-2">Aircraft</th>
                    <th className="py-2 px-2">Gate</th>
                    <th className="py-2 px-2">Arrival</th>
                    <th className="py-2 px-2">Departure</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {flights.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-2 font-mono font-bold text-white">{f.flightNumber}</td>
                      <td className="py-2.5 px-2 text-slate-300">{f.airline}</td>
                      <td className="py-2.5 px-2 text-slate-300 font-semibold">
                        {f.origin} ➔ {f.destination}
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">{f.aircraftType}</td>
                      <td className="py-2.5 px-2 font-bold text-sky-400">{f.gate}</td>
                      <td className="py-2.5 px-2 text-slate-300 tabular-nums">{f.scheduledArrival}</td>
                      <td className="py-2.5 px-2 text-slate-300 tabular-nums">{f.scheduledDeparture}</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            f.status === 'Boarding'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : f.status === 'Arriving'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            onCancelFlight(f.id);
                          }}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contracts.map((c) => {
                const meetsRep = reputation >= c.requiredReputation;

                return (
                  <div
                    key={c.id}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-sky-400" />
                          {c.airline}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.active
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {c.active ? 'Contract Active' : 'Available'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 py-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Flights:</span>
                          <span className="font-bold text-white">{c.flightsPerDay} flights / day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Weekly Payout:</span>
                          <span className="font-bold text-emerald-400 tabular-nums">
                            ${(c.payoutPerDay * 7).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Required Reputation:</span>
                          <span
                            className={`font-bold tabular-nums ${
                              meetsRep ? 'text-white' : 'text-rose-400'
                            }`}
                          >
                            {c.requiredReputation}+ (Current: {reputation})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Min. On-Time Rate:</span>
                          <span className="font-semibold text-slate-300">{c.minOnTimeRate}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!meetsRep && !c.active}
                      onClick={() => {
                        soundManager.playClick();
                        onToggleContract(c.id);
                      }}
                      className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        c.active
                          ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40'
                          : meetsRep
                          ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {c.active ? (
                        'Terminate Contract'
                      ) : meetsRep ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Sign Airline Contract
                        </>
                      ) : (
                        'Reputation Too Low'
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
