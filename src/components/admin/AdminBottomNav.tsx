import React, { useState } from 'react';
import { Package, TrendingUp, ClipboardList, MoreHorizontal, Coins, Wallet, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminTab } from '../../hooks/useAdminDashboard.ts';

interface AdminBottomNavProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const [showMore, setShowMore] = useState(false);

  const mainTabs = [
    { id: 'inventory', label: 'Inventario', icon: <Package className="w-5 h-5" /> },
    { id: 'sales', label: 'Ventas', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'audit', label: 'Auditoría', icon: <ClipboardList className="w-5 h-5" /> },
  ];

  const moreTabs = [
    { id: 'payments', label: 'Transacciones', icon: <Coins className="w-4 h-4" /> },
    { id: 'settlements', label: 'Tesorería', icon: <Wallet className="w-4 h-4" /> },
    { id: 'staff', label: 'Personal', icon: <Users className="w-4 h-4" /> },
  ];

  const isMoreActive = moreTabs.some(tab => tab.id === activeTab);

  const handleTabClick = (id: string) => {
    setActiveTab(id as AdminTab);
    setShowMore(false);
  };

  return (
    <>
      {/* More Options Menu (Bottom Sheet style) */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-[95] overflow-hidden border-t border-slate-100"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Más opciones</h3>
                <button onClick={() => setShowMore(false)} className="p-1 rounded-full hover:bg-slate-200">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-2">
                {moreTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-colors ${
                      activeTab === tab.id ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={activeTab === tab.id ? 'text-brand' : 'text-slate-400'}>
                      {tab.icon}
                    </div>
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex-1 py-1 flex flex-col items-center gap-1 transition-transform active:scale-95 relative"
            >
              {isActive && (
                <motion.div layoutId="nav-indicator" className="absolute -top-1 w-8 h-1 bg-brand rounded-b-full" />
              )}
              <div className={`${isActive ? 'text-brand' : 'text-slate-400'}`}>
                {tab.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-brand' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setShowMore(!showMore)}
          className="flex-1 py-1 flex flex-col items-center gap-1 transition-transform active:scale-95 relative"
        >
           {isMoreActive && (
              <motion.div layoutId="nav-indicator" className="absolute -top-1 w-8 h-1 bg-brand rounded-b-full" />
           )}
          <div className={`${isMoreActive || showMore ? 'text-brand' : 'text-slate-400'}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${isMoreActive || showMore ? 'text-brand' : 'text-slate-400'}`}>
            Más
          </span>
        </button>
      </nav>
    </>
  );
};
