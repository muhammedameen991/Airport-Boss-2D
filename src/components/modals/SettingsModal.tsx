import React from 'react';
import { X, Settings, Volume2, VolumeX, Save, RotateCcw, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { GameMode } from '../../types';

interface SettingsModalProps {
  soundEnabled: boolean;
  gameMode: GameMode;
  onClose: () => void;
  onToggleSound: () => void;
  onSaveGame: () => void;
  onResetGame: () => void;
  onSelectGameMode: (mode: GameMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  soundEnabled,
  gameMode,
  onClose,
  onToggleSound,
  onSaveGame,
  onResetGame,
  onSelectGameMode,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Airport Settings & System</h2>
              <p className="text-xs text-slate-400">Audio preferences, persistence, game mode, and developer credits.</p>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Audio Controls */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Synthesized Web Audio FX</h3>
              <p className="text-slate-400 text-xs">Jet engines, landing tires, boarding chimes, and cash sound effects.</p>
            </div>
            <button
              onClick={() => {
                onToggleSound();
                soundManager.playClick();
              }}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                soundEnabled
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Game Modes */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm">Simulation Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onSelectGameMode('career');
                }}
                className={`p-3 rounded-xl border text-left font-bold transition-all ${
                  gameMode === 'career'
                    ? 'bg-sky-500/20 border-sky-400 text-white'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-xs font-black">Career Mode</div>
                <div className="text-[10px] text-slate-400 font-normal">Level 1 to 5 Hub progression</div>
              </button>
              <button
                onClick={() => {
                  soundManager.playCash();
                  onSelectGameMode('sandbox');
                }}
                className={`p-3 rounded-xl border text-left font-bold transition-all ${
                  gameMode === 'sandbox'
                    ? 'bg-sky-500/20 border-sky-400 text-white'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-xs font-black">Sandbox Mode</div>
                <div className="text-[10px] text-slate-400 font-normal">Unlimited cash ($99M) & all unlocked</div>
              </button>
            </div>
          </div>

          {/* Save & Reset */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
            <button
              onClick={() => {
                soundManager.playCash();
                onSaveGame();
              }}
              className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Save className="w-4 h-4" /> Save Airport Progress
            </button>
            <button
              onClick={() => {
                soundManager.playAlert();
                onResetGame();
              }}
              className="py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-xl font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset Airport
            </button>
          </div>

          {/* Developer Credit */}
          <div className="p-4 bg-gradient-to-r from-sky-950/40 to-slate-900/80 border border-sky-500/30 rounded-2xl text-center space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
              Developed by Ameen
            </div>
            <a
              href="https://iamameen.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold transition-colors underline"
            >
              iamameen.vercel.app <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
            <p className="text-[11px] text-slate-400 pt-1">
              Airport Boss 2D © 2025 · Built with Canvas 2D, Web Audio API & Vanilla TypeScript.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
