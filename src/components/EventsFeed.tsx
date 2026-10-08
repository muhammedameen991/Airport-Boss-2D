import React from 'react';
import { Plane, AlertTriangle, FileText, DollarSign, Sun, Bell } from 'lucide-react';
import { AirportGameEvent } from '../types';

interface EventsFeedProps {
  events: AirportGameEvent[];
}

export const EventsFeed: React.FC<EventsFeedProps> = ({ events }) => {
  return (
    <aside className="hidden xl:flex flex-col w-72 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl z-20">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-sky-400" /> Recent Events
        </h2>
        <span className="text-[10px] text-slate-400 font-semibold">{events.length} logs</span>
      </div>

      <div className="space-y-2 mt-2.5 overflow-y-auto max-h-56 pr-0.5 scrollbar-none">
        {events.slice(0, 5).map((ev) => {
          let icon = <Plane className="w-4 h-4 text-emerald-400" />;
          let iconBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

          if (ev.type === 'warning') {
            icon = <AlertTriangle className="w-4 h-4 text-rose-400" />;
            iconBg = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
          } else if (ev.type === 'contract') {
            icon = <FileText className="w-4 h-4 text-sky-400" />;
            iconBg = 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
          } else if (ev.type === 'finance') {
            icon = <DollarSign className="w-4 h-4 text-emerald-400" />;
            iconBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          } else if (ev.type === 'weather') {
            icon = <Sun className="w-4 h-4 text-amber-400" />;
            iconBg = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
          }

          return (
            <div
              key={ev.id}
              className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 transition-colors"
            >
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${iconBg}`}>
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{ev.title}</h4>
                  <span className="text-[10px] text-slate-400 tabular-nums ml-1 shrink-0">{ev.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{ev.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
