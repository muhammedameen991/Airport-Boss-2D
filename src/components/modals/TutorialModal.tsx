import React, { useState } from 'react';
import { X, Plane, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface TutorialModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    step: 1,
    title: '1. Welcome to Airport Boss 2D',
    desc: 'You are the Director of this regional aviation facility. Your objective is to build runways, taxiways, terminals, manage live aircraft, process passengers, and grow into a world-class global hub!',
    icon: '✈️',
  },
  {
    step: 2,
    title: '2. Runways & Taxiways',
    desc: 'Runway 27/09 handles incoming arrivals and departures. Taxiway Bravo connects aircraft between the runway and the gate aprons. Keep paths clear to avoid taxi bottlenecks.',
    icon: '🛫',
  },
  {
    step: 3,
    title: '3. Gates & Aerobridges (A1 - A4)',
    desc: 'Gates connect to the Terminal concourse. Arriving aircraft park at gates, disembark passengers, undergo refueling, catering, and cabin cleaning before boarding new passengers.',
    icon: '🚪',
  },
  {
    step: 4,
    title: '4. Concourse & Passenger Simulation',
    desc: 'Watch simulated passengers arrive at curbside, check in at desks, clear TSA security, shop at Duty-Free & Cafes, and proceed down the aerobridge.',
    icon: '👥',
  },
  {
    step: 5,
    title: '5. Ground Support Fleet',
    desc: 'Automated fuel bowsers, baggage tugs, catering scissor trucks, and heavy pushback tugs service each aircraft simultaneously for speedy turnarounds.',
    icon: '🚚',
  },
  {
    step: 6,
    title: '6. Airline Contracts',
    desc: 'Partner with airlines like SkyWays, Sunrise Air, BlueJet, and Universal Air. Maintain high on-time performance to attract lucrative international airline contracts.',
    icon: '📝',
  },
  {
    step: 7,
    title: '7. Economy & Concessions',
    desc: 'Earn ticket fees, slot landing charges, retail concessions, transit hotel fees, and parking revenue. Monitor staff payroll and maintenance costs to maintain healthy net profit.',
    icon: '💰',
  },
  {
    step: 8,
    title: '8. Research & Tech Tree',
    desc: 'Invest in modern tech: self check-in kiosks, biometric e-gates, automated baggage sorters, and ILS CAT-III all-weather landing avionics.',
    icon: '🔬',
  },
  {
    step: 9,
    title: '9. Airport City Expansion',
    desc: 'Expand outside the perimeter! Build airport hotels, high-speed metro lines, cargo logistics warehouses, and open air routes to Mumbai, Dubai, Singapore, and London!',
    icon: '🌍',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const stepData = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stepData.icon}</span>
            <div>
              <h2 className="text-base font-extrabold text-white">Airport Operations Academy</h2>
              <p className="text-xs text-slate-400">Step {currentStep + 1} of {STEPS.length}</p>
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-black text-white">{stepData.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{stepData.desc}</p>

          <div className="flex gap-1.5 pt-4">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx === currentStep ? 'bg-sky-400' : idx < currentStep ? 'bg-emerald-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <button
            disabled={currentStep === 0}
            onClick={() => {
              soundManager.playClick();
              setCurrentStep((c) => Math.max(0, c - 1));
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => {
                soundManager.playClick();
                setCurrentStep((c) => c + 1);
              }}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-sky-500 hover:bg-sky-400 text-white flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                soundManager.playCash();
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" /> Ready to Direct!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
