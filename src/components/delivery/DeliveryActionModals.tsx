import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, X } from 'lucide-react';
import { Order } from '../../types/index.ts';

interface DeliveryActionModalsProps {
  orderToComplete: Order | null;
  setOrderToComplete: (order: Order | null) => void;
  executeCompleteDelivery: () => void;
  orderToCancel: Order | null;
  setOrderToCancel: (order: Order | null) => void;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  executeCancelDelivery: () => void;
  isSubmitting: boolean;
}

export const DeliveryActionModals: React.FC<DeliveryActionModalsProps> = ({
  orderToComplete,
  setOrderToComplete,
  executeCompleteDelivery,
  orderToCancel,
  setOrderToCancel,
  cancelReason,
  setCancelReason,
  executeCancelDelivery,
  isSubmitting
}) => {
  return (
    <>
      {/* Modal Completar Entrega */}
      <AnimatePresence>
        {orderToComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isSubmitting && setOrderToComplete(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Confirmar Entrega</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pedido #{orderToComplete.id.slice(0,8).toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOrderToComplete(null)}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-slate-600 mb-6 font-medium text-sm">
                  ¿Confirma que el pedido ha sido entregado correctamente a <strong className="text-slate-900">{orderToComplete.customerName}</strong> y que el pago (si aplica) ha sido gestionado?
                </p>

                <div className="bg-brand/5 border border-brand/10 p-4 rounded-xl mb-6">
                  <span className="text-[9px] font-bold text-brand uppercase tracking-widest block mb-1">Monto de la Orden</span>
                  <span className="text-2xl font-black text-slate-800 font-mono">${Number(orderToComplete.total).toFixed(2)}</span>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setOrderToComplete(null)}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeCompleteDelivery}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-brand hover:bg-brand-dark text-white font-black rounded-xl text-[11px] uppercase tracking-wider transition-colors shadow-md shadow-brand/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Procesando...' : 'Confirmar Entrega'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Reportar Problema / Cancelar en Ruta */}
      <AnimatePresence>
        {orderToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isSubmitting && setOrderToCancel(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <AlertTriangle className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Reportar Problema</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pedido #{orderToCancel.id.slice(0,8).toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOrderToCancel(null)}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-slate-600 mb-4 font-medium text-sm">
                  ¿Por qué no se puede entregar el pedido? Este volverá a estar disponible para que otro repartidor o el administrador lo atienda.
                </p>

                <div className="mb-6">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                    Motivo del problema
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ej. El cliente no responde al teléfono..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { setOrderToCancel(null); setCancelReason(""); }}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeCancelDelivery}
                    disabled={isSubmitting || !cancelReason.trim()}
                    className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-[11px] uppercase tracking-wider transition-colors shadow-md shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Procesando...' : 'Reportar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
