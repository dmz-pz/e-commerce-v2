import React from 'react';
import { Bike, ShoppingBag, CheckCircle2, RefreshCw } from 'lucide-react';

export type TabType = 'assigned' | 'ready' | 'history';

interface DeliveryTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  assignedCount: number;
  readyCount: number;
  historyCount: number;
  onRefresh: () => void;
}

export const DeliveryTabs: React.FC<DeliveryTabsProps> = ({
  activeTab,
  setActiveTab,
  assignedCount,
  readyCount,
  historyCount,
  onRefresh
}) => {
  return (
    <>
      {/* Desktop Navigation Tabs (Hidden on mobile) */}
      <div className="hidden md:flex justify-between items-center gap-4 mb-8">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'assigned' 
                ? 'bg-brand text-white shadow-md shadow-brand/10' 
                : 'text-slate-500 hover:text-brand hover:bg-slate-50'
            }`}
          >
            <Bike className="w-4 h-4" />
            Mis Rutas Activas ({assignedCount})
          </button>

          <button
            onClick={() => setActiveTab('ready')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'ready' 
                ? 'bg-brand text-white shadow-md shadow-brand/10' 
                : 'text-slate-500 hover:text-brand hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Pedidos Listos ({readyCount})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'history' 
                ? 'bg-brand text-white shadow-md shadow-brand/10' 
                : 'text-slate-500 hover:text-brand hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Historial ({historyCount})
          </button>
        </div>

        <button 
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 px-5 h-12 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-500 hover:text-brand font-bold text-[10px] uppercase tracking-wider cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refrescar
        </button>
      </div>

      {/* Mobile Refresh Button */}
      <div className="md:hidden flex justify-end mb-4">
        <button 
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-500 font-bold text-[10px] uppercase tracking-wider cursor-pointer min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          Refrescar
        </button>
      </div>
    </>
  );
};
