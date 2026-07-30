import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Receipt, AlertTriangle, UploadCloud, FileImage } from 'lucide-react';

interface PaymentReferenceModalProps {
  orderData: { id: string, total: number, customerName: string } | null;
  onClose: () => void;
  onSubmit: (reference: string, receiptFile?: File) => Promise<void>;
}

export const PaymentReferenceModal: React.FC<PaymentReferenceModalProps> = ({
  orderData,
  onClose,
  onSubmit,
}) => {
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!orderData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      setError('El número de referencia es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(reference.trim(), file);
      setReference('');
      setFile(undefined);
    } catch (error) {
      const err = error as Error;
      setError(err.message || 'Error al validar el pago.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 flex flex-col relative z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 shrink-0 bg-slate-50 relative">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Validar Pago</h3>
            <p className="text-slate-500 text-[11px] font-medium mt-1">
              Orden de <span className="font-bold text-slate-800">{orderData.customerName}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Payment Summary */}
            <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex justify-between items-center">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Monto a Corroborar</span>
              <span className="text-lg font-black text-orange-600 font-mono">${Number(orderData.total).toFixed(2)}</span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-[10px] font-bold tracking-tight">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Reference Input */}
            <div>
              <label htmlFor="refInput" className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">
                N° de Referencia <span className="text-red-500">*</span>
              </label>
              <input
                id="refInput"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. 1234567890"
                disabled={isSubmitting}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">
                Comprobante (Opcional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="fileUpload"
                  accept="image/jpeg, image/png, image/webp, application/pdf"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <label
                  htmlFor="fileUpload"
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand/30 hover:bg-slate-100 rounded-xl px-4 py-4 text-xs font-bold text-slate-500 transition-all cursor-pointer"
                >
                  {file ? (
                    <>
                      <FileImage className="w-4 h-4 text-brand" />
                      <span className="text-brand truncate max-w-[200px]">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Subir archivo o tomar foto</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reference.trim()}
                className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? 'Validando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
