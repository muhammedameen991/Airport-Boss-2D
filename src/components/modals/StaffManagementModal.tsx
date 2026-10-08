import React from 'react';
import { X, UserCheck, Plus, Minus, DollarSign, Award, AlertCircle } from 'lucide-react';
import { StaffDepartment } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface StaffManagementModalProps {
  staff: StaffDepartment[];
  cash: number;
  onClose: () => void;
  onUpdateStaffCount: (departmentId: string, delta: number) => void;
}

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  staff,
  cash,
  onClose,
  onUpdateStaffCount,
}) => {
  const totalSalaries = staff.reduce((acc, s) => acc + s.count * s.salaryPerHead, 0);
  const totalStaffCount = staff.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Airport Staff & Workforce</h2>
              <p className="text-xs text-slate-400">
                Total Personnel: {totalStaffCount} · Daily Payroll: ${totalSalaries.toLocaleString()}
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

        {/* Staff Departments List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {staff.map((dep) => {
            return (
              <div
                key={dep.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-sm">{dep.name}</h3>
                    <span className="text-xs font-semibold text-emerald-400">
                      {dep.efficiency}% Operational Efficiency
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{dep.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <span className="tabular-nums">
                      Salary: <strong className="text-white">${dep.salaryPerHead}</strong> / worker / day
                    </span>
                    <span className="tabular-nums">
                      Dept Payroll:{' '}
                      <strong className="text-emerald-400">
                        ${(dep.count * dep.salaryPerHead).toLocaleString()}/day
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    disabled={dep.count <= 2}
                    onClick={() => {
                      soundManager.playClick();
                      onUpdateStaffCount(dep.id, -1);
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="w-14 text-center">
                    <span className="text-base font-black text-white tabular-nums">{dep.count}</span>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">staff</span>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playCash();
                      onUpdateStaffCount(dep.id, 1);
                    }}
                    className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center transition-all shadow-md shadow-sky-500/20"
                  >
                    <Plus className="w-4 h-4" />
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
