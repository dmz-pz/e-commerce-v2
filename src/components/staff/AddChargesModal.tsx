import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, ShoppingBag, Copy, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ItemStatus } from '../../../generated/prisma/enums.ts';

interface AddChargesModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null; // Usar el tipo de orden completo si es posible, aquí lo relajamos por simplicidad
  onSubmit: (deliveryCost: number, bagsQuantity: number, bagPrice: number) => Promise<void>;
}

export const AddChargesModal: React.FC<AddChargesModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmit,
}) => {
  const [deliveryCost, setDeliveryCost] = useState<string>('');
  const [bagsQuantity, setBagsQuantity] = useState<number>(0);
  const [bagPrice, setBagPrice] = useState<string>('0.10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const currentTotal = Number(order.total);
  const exchangeRate = Number(order.exchangeRate) || 1;
  const numDeliveryCost = Number(deliveryCost) || 0;
  const numBagPrice = Number(bagPrice) || 0;
  const bagsTotal = bagsQuantity * numBagPrice;
  const bagsTotalBs = bagsTotal * exchangeRate;

  const newTotalUsd = currentTotal + numDeliveryCost + bagsTotal;
  const newTotalBs = newTotalUsd * exchangeRate;

  const handleCopyOrderInfo = () => {
    const header = `*PEDIDO #${order.id.slice(0, 8).toUpperCase()}* \n*Cliente:* ${order.customerName}\n\n*PRODUCTOS:*\n`;

    // Lista de items actuales
    const itemsList = order.items.map((item: any) => {
      let statusTag = '';
      if (item.status === ItemStatus.CANCELLED) {
        statusTag = ' ❌ [Eliminado/Agotado]';
      } else if (item.status === ItemStatus.SUBSTITUTED) {
        statusTag = ' 🔄 [Sustituido]';
      }
      return `• ${item.requestedQuantity ?? item.quantity ?? 1}x ${item.name}${statusTag}`;
    });

    // Añadir bolsas si hay
    if (bagsQuantity > 0) {
      itemsList.push(`• ${bagsQuantity}x Bolsa(s) Empaque`);
    }

    const itemsString = itemsList.join('\n');

    const paymentMethodName = order.payment?.method || 'Efectivo / En Entrega';
    const footer = `\n\n*Costos Adicionales:*\n• Delivery: $${numDeliveryCost.toFixed(2)}\n• Bolsas: $${bagsTotal.toFixed(2)}\n\n*Método de pago:* ${paymentMethodName} \n*Total Definitivo:* Ref. ${newTotalUsd.toFixed(2)}   Bs. ${newTotalBs.toFixed(2)}`;

    navigator.clipboard.writeText(`${header}${itemsString}${footer}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Error al copiar: ', err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numDeliveryCost < 0) {
      setError("El costo de delivery no puede ser negativo.");
      return;
    }
    if (bagsQuantity < 0) {
      setError("La cantidad de bolsas no puede ser negativa.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(numDeliveryCost, bagsQuantity, numBagPrice);
      setDeliveryCost('');
      setBagsQuantity(0);
      setBagPrice('0.10');
      onClose();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar los cargos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center text-accent-dark shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-black text-accent-dark uppercase tracking-[0.2em] block">
                  Finalizar Preparación
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5">
                  Añadir Cargos
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-200/50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Delivery Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Truck className="w-3 h-3" /> Costo del Delivery ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={deliveryCost}
                    onChange={e => setDeliveryCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-8 text-sm font-bold focus:border-accent outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Bags Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3" /> Empaque (Bolsas)
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Bag Quantity */}
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1">Cantidad</label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                      <button
                        type="button"
                        onClick={() => setBagsQuantity(Math.max(0, bagsQuantity - 1))}
                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-lg font-black text-slate-900 w-12 text-center">{bagsQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setBagsQuantity(bagsQuantity + 1)}
                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Bag Price */}
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1">Precio c/u ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={bagPrice}
                        onChange={e => setBagPrice(e.target.value)}
                        placeholder="0.10"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-3 text-sm font-bold focus:border-accent outline-none transition-colors h-[52px]"
                      />
                    </div>
                  </div>
                </div>

                {bagsQuantity > 0 && (
                  <div className="mt-2 flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Subtotal Bolsas:</span>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">${bagsTotal.toFixed(2)}</span>
                      <span className="text-[9px] font-bold text-slate-400 ml-2">Bs. {bagsTotalBs.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Preview */}
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-orange-600/60 uppercase tracking-[0.2em] mb-1">
                    Nuevo Gran Total
                  </span>
                  <span className="text-[11px] font-bold text-orange-600/80">
                    Bs. {newTotalBs.toFixed(2)}
                  </span>
                </div>
                <span className="text-2xl font-black text-orange-600">
                  ${newTotalUsd.toFixed(2)}
                </span>
              </div>

              {/* Copy Message Action */}
              <button
                type="button"
                onClick={handleCopyOrderInfo}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${copied
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> ¡Mensaje Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar Mensaje para el Cliente
                  </>
                )}
              </button>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-accent hover:bg-accent-dark text-brand rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-accent/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Notificar y Avanzar a Pago</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
