import React from 'react';
import { Logo } from '../Logo.tsx';
import { OrderStatus } from '../../types/index.ts';

interface StaffHeaderProps {
  filter: OrderStatus | 'all';
  setFilter: (filter: OrderStatus | 'all') => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({ filter, setFilter }) => {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 md:mb-10 gap-6">
      <div>
        <div className="flex items-center gap-3 mb-2 text-brand font-mono text-[10px] font-black uppercase tracking-[0.3em]">
          <Logo className="w-8 h-8" />
          Nodo de Control Operativo
        </div>
        <h1 className="text-3xl font-light text-slate-900 tracking-tight">
          Lista de <span className="font-bold text-brand">Pedidos Activos</span>
        </h1>
      </div>
      
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto max-w-full no-scrollbar whitespace-nowrap gap-1 self-start md:self-auto shrink-0">
        {(['all', OrderStatus.PENDING, OrderStatus.PICKING, OrderStatus.READY_TO_PAY, OrderStatus.CANCELLED] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              filter === s 
                ? 'bg-brand text-white shadow-md' 
                : 'text-slate-400 hover:text-brand hover:bg-slate-50'
            }`}
          >
            {s === 'all'
              ? 'Todas'
              : s === OrderStatus.PENDING
              ? 'Pendientes'
              : s === OrderStatus.PICKING
              ? 'En Curso'
              : s === OrderStatus.READY_TO_PAY
              ? 'Listas'
              : 'Canceladas'}
          </button>
        ))}
      </div>
    </header>
  );
};
