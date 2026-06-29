import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, ShieldAlert, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Payment } from '../../types/index.ts';

interface PaymentsTabProps {
  payments: Payment[];
  onReviewPayment: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  payments,
  onReviewPayment,
}) => {
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const filteredPayments = payments.filter((p) =>
    paymentFilter === 'ALL' ? true : p.status === paymentFilter
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="payments-panel"
      className="space-y-6"
      id="payments-tab-panel"
    >
      {/* Payment Filter Selector */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200/80 shadow-sm overflow-x-auto max-w-full no-scrollbar whitespace-nowrap gap-1 self-start">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filterVal) => (
          <button
            key={filterVal}
            onClick={() => setPaymentFilter(filterVal)}
            className={`px-4.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              paymentFilter === filterVal
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            {filterVal === 'ALL'
              ? 'Todos'
              : filterVal === 'PENDING'
              ? 'Pendientes Verificación'
              : filterVal === 'APPROVED'
              ? 'Aprobados'
              : 'Rechazados'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredPayments.length === 0 ? (
          <div className="col-span-full py-28 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Coins className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="font-bold text-slate-500 text-lg">No hay transacciones registradas</p>
            <p className="text-slate-400 text-xs mt-1">Las transacciones enviadas por los clientes de la tienda aparecerán aquí.</p>
          </div>
        ) : (
          filteredPayments.map((pay) => (
            <div
              key={pay.id}
              className="bg-white border border-slate-200/80 rounded-[2rem] p-6 md:p-8 hover:shadow-lg transition-all flex flex-col sm:flex-row gap-6 relative"
            >
              {/* View Screenshot Receipt Panel If available */}
              <button
                className="w-full sm:w-36 h-48 sm:h-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer shrink-0 relative group flex items-center justify-center text-slate-400"
                onClick={() => pay.receiptUrl && setSelectedReceipt(pay.receiptUrl)}
                title={pay.receiptUrl ? "Ampliar comprobante de pago" : "No requiere captura de pantalla"}
              >
                {pay.receiptUrl ? (
                  <>
                    <img
                      src={pay.receiptUrl}
                      alt="Captura comprobante"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                      Ver Grande
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sin captura</p>
                    <p className="text-[9px] text-slate-300 mt-1">(Pago en entrega/físico)</p>
                  </div>
                )}
              </button>

              {/* Transaction Metadata details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        pay.status === 'PENDING'
                          ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
                          : pay.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-rose-50 text-rose-500 border-rose-100'
                      }`}
                    >
                      {pay.status === 'PENDING'
                        ? 'Audit. Pendiente'
                        : pay.status === 'APPROVED'
                        ? 'Verificado'
                        : 'Rechazado'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 font-bold">ID: {pay.id.slice(0, 8)}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 font-mono tracking-tight">
                    ${Number(pay.amount).toFixed(2)} USD
                  </h3>

                  <div className="space-y-2 mt-4 text-xs font-medium text-slate-500">
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                      <span className="text-slate-400">Método de Cobro:</span>
                      <span className="font-bold text-slate-700">{pay.method}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                      <span className="text-slate-400">Referencia de Depósito:</span>
                      <span className="font-mono font-bold text-brand">{pay.reference}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                      <span className="text-slate-400">Pedido Vinculado:</span>
                      <span className="font-bold text-slate-700 font-mono text-[11px] underline underline-offset-2">
                        {pay.orderId.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Fecha de Registro:</span>
                      <span className="text-slate-700 font-bold">
                        {new Date(pay.createdAt).toLocaleDateString()} {new Date(pay.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {pay.status === 'PENDING' ? (
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onReviewPayment(pay.id, 'APPROVED')}
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] h-10 px-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobar Pago
                    </button>
                    <button
                      onClick={() => onReviewPayment(pay.id, 'REJECTED')}
                      className="flex-1 bg-rose-50 text-rose-500 hover:bg-rose-100 text-[10px] h-10 px-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors border border-rose-100"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Auditoría procesada con éxito</span>
                    <span className={`w-2 h-2 rounded-full ${pay.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- RECEIPT MODAL OVERLAY --- */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm cursor-default w-full h-full"
              onClick={() => setSelectedReceipt(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] max-w-lg w-full overflow-hidden border border-slate-100 shadow-2xl relative z-10 flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Recibo / Captura de Pago
                </span>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-hidden">
                <img
                  src={selectedReceipt}
                  alt="Receipt proof"
                  className="max-w-full max-h-[60vh] rounded-xl object-contain drop-shadow"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
