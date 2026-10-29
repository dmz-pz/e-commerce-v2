import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Package, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PAGO_MOVIL: 'Pago Móvil',
  ZELLE: 'Zelle',
  EFECTIVO_DELIVERY: 'Efectivo al Entregar',
  PUNTO_DELIVERY: 'Punto de Venta al Entregar',
};

interface OrderSuccessModalProps {
  isOpen: boolean;
  orderId: string | null;
  total?: number;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress: string;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  orderId,
  paymentMethod,
  deliveryMethod,
  deliveryAddress,
  onClose,
}) => {
  if (!isOpen || !orderId) return null;

  const formattedPaymentMethod = PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod.replace(/_/g, ' ');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-emerald-500 p-6 sm:p-7 text-center relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/20 relative z-10"
            >
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight relative z-10 mb-1">
              ¡Pedido Registrado con Éxito!
            </h2>
            <p className="text-emerald-50 font-medium relative z-10 text-xs sm:text-sm">
              Hemos recibido tu orden y ya comenzamos a prepararla.
            </p>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="text-center mb-5 sm:mb-6">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nro. de Pedido</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">#{orderId.split('-')[0]?.toUpperCase()}</p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6">
              <div className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Método de Entrega</p>
                  <p className="text-sm font-bold text-slate-800">{deliveryMethod === 'DELIVERY' ? 'Envío a Domicilio' : 'Retiro en Tienda'}</p>
                  {deliveryMethod === 'DELIVERY' && (
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1 break-words">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                      <span>{deliveryAddress}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Método de Pago</p>
                  <p className="text-sm font-bold text-slate-800">{formattedPaymentMethod}</p>
                  <p className="text-xs text-slate-500 mt-0.5">El pago se coordinará al confirmar tu orden</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                to="/profile#orders"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
              >
                Seguir mi pedido
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                onClick={onClose}
                className="w-full flex items-center justify-center py-3 sm:py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors text-xs sm:text-sm"
              >
                Volver a la tienda
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
