import React from 'react';
import { Plane, CheckCircle2, Circle, Eye, Clock, Users, DoorOpen } from 'lucide-react';
import { Flight, AircraftState } from '../types';
import { soundManager } from '../audio/soundManager';

interface FlightInspectorProps {
  flight: Flight | undefined;
  onFollowAircraft?: (flightId: string) => void;
}

const STEPS: { state: AircraftState; label: string }[] = [
  { state: 'LANDING', label: 'Arrived' },
  { state: 'TAXIING', label: 'Taxiing' },
  { state: 'AT_GATE', label: 'At Gate' },
  { state: 'BOARDING', label: 'Boarding' },
  { state: 'PUSHBACK', label: 'Pushback' },
  { state: 'TAXI_TO_RUNWAY', label: 'Taxi to Runway' },
  { state: 'DEPARTED', label: 'Departed' },
];

export const FlightInspector: React.FC<FlightInspectorProps> = ({ flight, onFollowAircraft }) => {
  if (!flight) return null;

  // Determine which steps are complete based on currentStep
  const stepIndex = STEPS.findIndex((s) => s.state === flight.currentStep);

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl z-20">
      {/* Flight Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Plane className="w-4 h-4 transform -rotate-45" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white">Flight {flight.flightNumber}</h2>
            <p className="text-[11px] text-slate-400">{flight.airline}</p>
          </div>
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            flight.status === 'Boarding'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : flight.status === 'Arriving'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
          }`}
        >
          {flight.status}
        </span>
      </div>

      {/* Flight Details Grid */}
      <div className="py-3 text-xs space-y-2 border-b border-slate-800 text-slate-300">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Route:</span>
          <span className="font-semibold text-white">
            {flight.origin} ➔ {flight.destination}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Aircraft:</span>
          <span className="font-semibold text-white">{flight.aircraftType}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <DoorOpen className="w-3.5 h-3.5 text-sky-400" /> Gate:
          </span>
          <span className="font-bold text-sky-400">{flight.gate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Passengers:
          </span>
          <span className="font-semibold text-white tabular-nums">
            {flight.passengers} / {flight.maxPassengers}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Arrival:
          </span>
          <span className="font-medium text-emerald-400 tabular-nums">
            {flight.scheduledArrival} (On time)
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Departure:
          </span>
          <span className="font-medium text-slate-200 tabular-nums">{flight.scheduledDeparture}</span>
        </div>
      </div>

      {/* Operational Checklist */}
      <div className="py-3 space-y-1.5 flex-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Turnaround Checklist
        </h3>
        {STEPS.map((step, idx) => {
          const isDone = stepIndex > idx || (stepIndex === -1 && flight.status === 'Departed');
          const isCurrent = stepIndex === idx;

          return (
            <div
              key={step.label}
              className={`flex items-center gap-2 text-xs py-0.5 transition-colors ${
                isCurrent ? 'font-bold text-sky-400' : isDone ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                </div>
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Follow Camera Action */}
      <button
        onClick={() => {
          soundManager.playClick();
          onFollowAircraft?.(flight.id);
        }}
        className="w-full mt-2 py-2 px-3 bg-sky-600/30 hover:bg-sky-600 border border-sky-500/40 rounded-xl text-xs font-bold text-sky-200 hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-md"
      >
        <Eye className="w-3.5 h-3.5" /> Follow in Camera
      </button>
    </aside>
  );
};
