import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Banknote, CheckCircle2, History, User, Wallet, Search, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService.ts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const SettlementsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [historySearch, setHistorySearch] = useState('');

  // Consulta 1: Efectivo en mano de motorizados (polling de 15s)
  const { data: driversData, isLoading: isDriversLoading, isFetching: isDriversFetching } = useQuery({
    queryKey: ['admin-drivers-cash'],
    queryFn: () => adminService.getDriversCash(),
    refetchInterval: 15000,
  });

  // Consulta 2: Historial de liquidaciones realizadas (polling de 15s)
  const { data: settlementsData, isLoading: isSettlementsLoading } = useQuery({
    queryKey: ['admin-settlements'],
    queryFn: () => adminService.getSettlements(),
    refetchInterval: 15000,
  });

  const drivers = driversData || [];
  const history = settlementsData || [];
  const isLoading = isDriversLoading || isSettlementsLoading;

  // Mutación para liquidar efectivo de un motorizado
  const settleMutation = useMutation({
    mutationFn: (driverId: string) => adminService.settleCash(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers-cash'] });
      queryClient.invalidateQueries({ queryKey: ['admin-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    }
  });

  const handleSettle = async (driverId: string, driverName: string, amount: number) => {
    if (window.confirm(`¿Confirmas que recibiste físicamente $${amount.toFixed(2)} USD en efectivo del motorizado ${driverName}?`)) {
      try {
        await settleMutation.mutateAsync(driverId);
      } catch (error) {
        const err = error as Error;
        alert(err.message || "Error al liquidar el efectivo.");
      }
    }
  };

  // Filtrado reactivo en el cliente del historial de auditoría
  const filteredHistory = history.filter((record) =>
    record.driverName.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Columna Izquierda */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative">
          {isDriversFetching && <RefreshCw className="absolute top-6 right-6 w-4 h-4 animate-spin text-slate-300" />}
          
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
                      disabled={settleMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
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
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto max-h-[500px] pr-2 no-scrollbar space-y-3">
            {filteredHistory.length === 0 && !isLoading ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">No hay registros de liquidaciones aún.</div>
            ) : (
              filteredHistory.map((record) => (
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
