import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Banknote, CheckCircle2, History, User, Wallet, Search } from 'lucide-react';
import { adminService, DriverCashDTO, SettlementDTO } from '../../services/adminService.ts';

export const SettlementsTab: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverCashDTO[]>([]);
  const [history, setHistory] = useState<SettlementDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [driversData, historyData] = await Promise.all([
        adminService.getDriversCash(),
        adminService.getSettlements()
      ]);
      setDrivers(Array.isArray(driversData) ? driversData : []);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error("Error cargando liquidaciones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh cada 15 segundos
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSettle = async (driverId: string, driverName: string, amount: number) => {
    if (window.confirm(`¿Confirmas que recibiste físicamente $${amount.toFixed(2)} USD en efectivo del motorizado ${driverName}?`)) {
      try {
        await adminService.settleCash(driverId);
        loadData();
      } catch (error) {
        const err = error as Error;
        alert(err.message || "Error al liquidar el efectivo.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Columna Izquierda */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Efectivo por Rendir
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Motorizados con dinero físico
              </p>
            </div>
          </div>

          {isLoading && drivers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium text-sm">Cargando datos...</div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">Todo al día</p>
              <p className="text-slate-400 text-xs mt-1">Ningún motorizado tiene efectivo pendiente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div key={driver.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{driver.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Estado:</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${driver.status === 'AVAILABLE' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {driver.status === 'AVAILABLE' ? 'EN BASE' : 'EN RUTA'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                    <div className="text-xl font-black text-slate-900 font-mono">
                      ${driver.cashInHand.toFixed(2)} <span className="text-xs text-slate-400">USD</span>
                    </div>
                    <button
                      onClick={() => handleSettle(driver.id, driver.name, driver.cashInHand)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Banknote className="w-4 h-4" />
                      Recibir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Auditoría de Recepción
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Historial de dinero entregado en base
              </p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por motorizado..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-300 transition-colors"
            />
          </div>

          <div className="overflow-y-auto max-h-[500px] pr-2 no-scrollbar space-y-3">
            {history.length === 0 && !isLoading ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">No hay registros de liquidaciones aún.</div>
            ) : (
              history.map((record) => (
                <div key={record.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{record.driverName}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                      <span>Recibido por: {record.reviewedByName}</span>
                      <span>•</span>
                      <span>{new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-emerald-600">
                      +${record.amount.toFixed(2)}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest font-black text-emerald-400 mt-1">Ingreso a Caja</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
