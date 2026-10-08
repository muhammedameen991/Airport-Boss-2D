import React from 'react';
import { X, FlaskConical, Check, Clock, DollarSign, Sparkles } from 'lucide-react';
import { ResearchTech } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface ResearchTreeModalProps {
  research: ResearchTech[];
  cash: number;
  onClose: () => void;
  onStartResearch: (techId: string) => void;
}

export const ResearchTreeModal: React.FC<ResearchTreeModalProps> = ({
  research,
  cash,
  onClose,
  onStartResearch,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Airport Aviation R&D Tree</h2>
              <p className="text-xs text-slate-400">Unlock modern passenger automation, avionics, and logistics tech.</p>
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

        {/* Tech Tree Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {research.map((tech) => {
            const canAfford = cash >= tech.cost;

            return (
              <div
                key={tech.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-white text-sm">{tech.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tech.unlocked
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tech.researching
                          ? 'bg-sky-500/20 text-sky-400 animate-pulse border border-sky-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {tech.unlocked ? 'Unlocked' : tech.researching ? 'In Progress' : 'Locked'}
                    </span>
                  </div>
                  <p className="text-xs text-sky-300/90 font-medium mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    {tech.effect}
                  </p>
                </div>

                <div>
                  {tech.researching && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Research Progress</span>
                        <span>{tech.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all"
                          style={{ width: `${tech.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!tech.unlocked && !tech.researching && (
                    <div className="flex items-center justify-between text-xs py-2 border-t border-slate-700/60 font-semibold mb-3">
                      <span className="text-emerald-400 tabular-nums">${tech.cost.toLocaleString()}</span>
                      <span className="text-slate-400">{tech.researchTimeSeconds}s development</span>
                    </div>
                  )}

                  <button
                    disabled={tech.unlocked || tech.researching || !canAfford}
                    onClick={() => {
                      soundManager.playBuild();
                      onStartResearch(tech.id);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      tech.unlocked
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 cursor-default'
                        : tech.researching
                        ? 'bg-purple-950/40 text-purple-300 border border-purple-800/40 cursor-default'
                        : canAfford
                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {tech.unlocked ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Technology Implemented
                      </>
                    ) : tech.researching ? (
                      'Research in Progress...'
                    ) : canAfford ? (
                      'Begin Research'
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
