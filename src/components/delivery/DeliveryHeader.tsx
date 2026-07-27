import React from 'react';
import { Logo } from '../Logo.tsx';

interface DeliveryHeaderProps {
  user: { name: string } | null;
  cashInHand: number;
  driverStatus: 'available' | 'busy' | 'offline';
  onStatusChange: (status: 'available' | 'busy' | 'offline') => void;
}

export const DeliveryHeader: React.FC<DeliveryHeaderProps> = ({
  user,
  cashInHand,
  driverStatus,
  onStatusChange,
}) => {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 border-b border-slate-200/60 pb-8">
      <div>
        <div className="flex items-center gap-3 mb-2 text-brand font-mono text-[10px] font-black uppercase tracking-[0.3em]">
          <Logo className="w-8 h-8" />
          Terminal de Repartidores
        </div>
        <h1 className="text-3xl font-light text-slate-900 tracking-tight">
          Control de <span className="font-bold text-brand">Entregas Urbanas</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Conectado como: <span className="text-slate-800 font-bold">{user?.name || "Repartidor Independiente"}</span>
          <span className="mx-2 text-slate-300">|</span>
          Efectivo en Caja: <span className="text-emerald-600 font-black">${Number(cashInHand ?? 0).toFixed(2)}</span>
        </p>
      </div>

      {/* Quick Status Pill selector */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto">
        <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest pl-3 pr-2 hidden sm:inline-block">Estado:</span>
        
        <button 
          onClick={() => onStatusChange('available')}
          className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer min-h-[44px] sm:min-h-[auto] ${
            driverStatus === 'available' 
              ? 'bg-emerald-500 text-white shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${driverStatus === 'available' ? 'bg-white' : 'bg-emerald-500'} inline-block`} />
          Disponible
        </button>

        <button 
          onClick={() => onStatusChange('busy')}
          className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer min-h-[44px] sm:min-h-[auto] ${
            driverStatus === 'busy' 
              ? 'bg-orange-500 text-white shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${driverStatus === 'busy' ? 'bg-white' : 'bg-orange-500'} inline-block`} />
          En Ruta
        </button>

        <button 
          onClick={() => onStatusChange('offline')}
          className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer min-h-[44px] sm:min-h-[auto] ${
            driverStatus === 'offline' 
              ? 'bg-slate-500 text-white shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${driverStatus === 'offline' ? 'bg-white' : 'bg-slate-500'} inline-block`} />
          Offline
        </button>
      </div>
    </header>
  );
};
