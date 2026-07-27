import React from 'react';
import { Bike, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { TabType } from './DeliveryTabs.tsx';

interface DeliveryBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  assignedCount: number;
  readyCount: number;
}

export const DeliveryBottomNav: React.FC<DeliveryBottomNavProps> = ({
  activeTab,
  setActiveTab,
  assignedCount,
  readyCount
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-40 pb-safe">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === 'assigned' ? 'text-brand' : 'text-slate-400'}`}
        >
          <div className="relative">
            <Bike className="w-5 h-5" />
            {assignedCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {assignedCount}
              </span>
            )}
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider">Rutas</span>
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === 'ready' ? 'text-brand' : 'text-slate-400'}`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {readyCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {readyCount}
              </span>
            )}
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider">Listos</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === 'history' ? 'text-brand' : 'text-slate-400'}`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Historial</span>
        </button>
      </div>
    </div>
  );
};
