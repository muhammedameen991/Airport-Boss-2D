import React from 'react';
import {
  Hammer,
  Plane,
  Navigation,
  Users,
  Luggage,
  UserCheck,
  DollarSign,
  BarChart2,
  FlaskConical,
  Building,
  Settings,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export type ActiveModal =
  | null
  | 'build'
  | 'flights'
  | 'aircraft'
  | 'passengers'
  | 'baggage'
  | 'staff'
  | 'finances'
  | 'statistics'
  | 'research'
  | 'city'
  | 'settings';

interface SidebarProps {
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  buildModeActive: boolean;
  onToggleBuildMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModal,
  setActiveModal,
  buildModeActive,
  onToggleBuildMode,
}) => {
  const menuItems = [
    {
      id: 'build' as ActiveModal,
      label: 'Build',
      icon: Hammer,
      highlight: buildModeActive || activeModal === 'build',
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'build' ? null : 'build');
      },
    },
    {
      id: 'flights' as ActiveModal,
      label: 'Flights',
      icon: Plane,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'flights' ? null : 'flights');
      },
    },
    {
      id: 'aircraft' as ActiveModal,
      label: 'Aircraft',
      icon: Navigation,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'aircraft' ? null : 'aircraft');
      },
    },
    {
      id: 'passengers' as ActiveModal,
      label: 'Passengers',
      icon: Users,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'passengers' ? null : 'passengers');
      },
    },
    {
      id: 'baggage' as ActiveModal,
      label: 'Baggage',
      icon: Luggage,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'baggage' ? null : 'baggage');
      },
    },
    {
      id: 'staff' as ActiveModal,
      label: 'Staff',
      icon: UserCheck,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'staff' ? null : 'staff');
      },
    },
    {
      id: 'finances' as ActiveModal,
      label: 'Finances',
      icon: DollarSign,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'finances' ? null : 'finances');
      },
    },
    {
      id: 'statistics' as ActiveModal,
      label: 'Statistics',
      icon: BarChart2,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'statistics' ? null : 'statistics');
      },
    },
    {
      id: 'research' as ActiveModal,
      label: 'Research',
      icon: FlaskConical,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'research' ? null : 'research');
      },
    },
    {
      id: 'city' as ActiveModal,
      label: 'City',
      icon: Building,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'city' ? null : 'city');
      },
    },
    {
      id: 'settings' as ActiveModal,
      label: 'Settings',
      icon: Settings,
      action: () => {
        soundManager.playClick();
        setActiveModal(activeModal === 'settings' ? null : 'settings');
      },
    },
  ];

  return (
    <aside className="absolute left-3 top-16 bottom-16 z-20 flex flex-col gap-1 w-14 md:w-36 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 shadow-2xl overflow-y-auto scrollbar-none">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeModal === item.id || item.highlight;

        return (
          <button
            key={item.label}
            onClick={item.action}
            className={`flex items-center gap-2.5 px-2.5 py-2 md:py-2.5 rounded-xl font-semibold text-xs transition-all text-left group ${
              isActive
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? 'text-white' : 'text-sky-400'
              }`}
            />
            <span className="hidden md:inline font-bold tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};
