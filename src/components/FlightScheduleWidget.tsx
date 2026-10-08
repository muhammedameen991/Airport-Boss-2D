import React from 'react';
import { Plane } from 'lucide-react';
import { Flight } from '../types';
import { soundManager } from '../audio/soundManager';

interface FlightScheduleWidgetProps {
  flights: Flight[];
  selectedFlightId: string | null;
  onSelectFlight: (id: string) => void;
  onViewAll: () => void;
}

export const FlightScheduleWidget: React.FC<FlightScheduleWidgetProps> = ({
  flights,
  selectedFlightId,
  onSelectFlight,
  onViewAll,
}) => {
  return (
    <div className="hidden lg:flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl z-20 w-80 xl:w-96 text-xs select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Plane className="w-3.5 h-3.5 text-sky-400 transform -rotate-45" />
          <span>Flight Schedule</span>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            onViewAll();
          }}
          className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800 pb-1">
              <th className="py-1 px-1">Flight</th>
              <th className="py-1 px-1">Airline</th>
              <th className="py-1 px-1">Route</th>
              <th className="py-1 px-1">Gate</th>
              <th className="py-1 px-1 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {flights.slice(0, 5).map((f) => {
              const isSelected = selectedFlightId === f.id;

              return (
                <tr
                  key={f.id}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectFlight(f.id);
                  }}
                  className={`cursor-pointer transition-colors hover:bg-slate-800/80 ${
                    isSelected ? 'bg-sky-500/20 text-sky-300' : 'text-slate-200'
                  }`}
                >
                  <td className="py-1.5 px-1 font-bold font-mono text-white">{f.flightNumber}</td>
                  <td className="py-1.5 px-1 truncate max-w-[70px] text-slate-300">{f.airline}</td>
                  <td className="py-1.5 px-1 truncate max-w-[85px] text-[11px] text-slate-300">
                    {f.origin} ➔ {f.destination}
                  </td>
                  <td className="py-1.5 px-1 font-bold text-sky-400">{f.gate}</td>
                  <td className="py-1.5 px-1 text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        f.status === 'Boarding'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : f.status === 'Arriving'
                          ? 'bg-sky-500/20 text-sky-400'
                          : f.status === 'Loading'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
