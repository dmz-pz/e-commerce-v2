import React from 'react';
import { Package, Coins, Activity } from 'lucide-react';

interface AdminStatsProps {
  productsCount: number;
  pendingPaymentsCount: number;
  auditLogsCount: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  productsCount,
  pendingPaymentsCount,
  auditLogsCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full lg:w-auto shrink-0" id="admin-stats-grid">
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productos</p>
          <p className="text-[18px] font-black text-slate-800 font-mono">{productsCount}</p>
        </div>
      </div>

      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/5 flex items-center justify-center text-orange-600">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transacciones</p>
          <p className="text-[18px] font-black text-slate-800 font-mono">
            {pendingPaymentsCount} <span className="text-[11px] text-orange-500 font-semibold uppercase">Pend</span>
          </p>
        </div>
      </div>

      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-500/5 flex items-center justify-center text-green-600">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historial Logs</p>
          <p className="text-[18px] font-black text-slate-800 font-mono">{auditLogsCount}</p>
        </div>
      </div>
    </div>
  );
};
