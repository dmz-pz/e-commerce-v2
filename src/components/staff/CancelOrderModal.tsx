import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Ban, CheckCircle2 } from 'lucide-react';

interface CancelOrderModalProps {
  cancelingOrder: { id: string; customerName: string; isLastItem?: boolean } | null;
  onClose: () => void;
  onConfirmCancel: (orderId: string, reason: string) => Promise<void>;
  errorMessage?: string | null;
}

const PREDEFINED_REASONS = [
  "Falta total de stock / Inventario agotado",
  "Cliente solicitó la cancelación del pedido",
  "Dirección o datos de contacto inválidos",
  "Inconveniente operativo en tienda / almacén",
  "Otro motivo (Especifique a continuación)",
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  cancelingOrder,
  onClose,
  onConfirmCancel,
  errorMessage,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(PREDEFINED_REASONS[0]);
  const [customDetail, setCustomDetail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!cancelingOrder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason.startsWith("Otro")
      ? (customDetail.trim() || selectedReason)
      : (customDetail.trim() ? `${selectedReason} - ${customDetail.trim()}` : selectedReason);

    setIsSubmitting(true);
    try {
      await onConfirmCancel(cancelingOrder.id, finalReason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="cancel-order-overlay">
        {/* Backdrop clickable element */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-transparent cursor-default w-full h-full border-none outline-none"
          onClick={onClose}
          aria-label="Cerrar modal"
        />

        {/* Content Container */}
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] relative z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-red-50/50 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-[0.2em] block">
                  Cancelación de Pedido
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5">
                  Orden #{cancelingOrder.id.slice(0, 8)}
                </h3>
                <p className="text-slate-500 text-[11px] font-medium mt-1">
                  Cliente: <span className="font-bold text-slate-800">{cancelingOrder.customerName}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-200/50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Warning for last item removal */}
            {cancelingOrder.isLastItem && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-800 text-[11px] font-bold leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Un pedido no puede quedar sin productos. Para eliminar el único producto restante, la orden debe ser cancelada especificando el motivo a continuación.
                </span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 font-bold text-[10px]">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Seleccione el Motivo de Cancelación
              </label>
              <div className="space-y-2">
                {PREDEFINED_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedReason === reason
                        ? 'bg-red-50/60 border-red-200 text-red-900 shadow-sm'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-red-600 w-4 h-4"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="custom-detail-input" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Detalle Adicional u Observaciones (Opcional)
              </label>
              <textarea
                id="custom-detail-input"
                rows={3}
                placeholder="Escriba aquí más detalles sobre el motivo..."
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    <span>Confirmar Cancelación</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
