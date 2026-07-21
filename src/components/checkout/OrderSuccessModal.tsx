import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Package, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderSuccessModalProps {
  isOpen: boolean;
  orderId: string | null;
  total: number;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress: string;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  orderId,
  total,
  paymentMethod,
  deliveryMethod,
  deliveryAddress,
  onClose,
}) => {
  if (!isOpen || !orderId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/20 relative z-10"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <h2 className="text-2xl font-black text-white tracking-tight relative z-10 mb-1">
              ¡Pedido Registrado con Éxito!
            </h2>
            <p className="text-emerald-50 font-medium relative z-10 text-sm">
              Hemos recibido tu orden y ya comenzamos a prepararla.
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Nro. de Pedido</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">#{orderId.split('-')[0].toUpperCase()}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Método de Entrega</p>
                  <p className="text-sm font-bold text-slate-800">{deliveryMethod === 'DELIVERY' ? 'Envío a Domicilio' : 'Retiro en Tienda'}</p>
                  {deliveryMethod === 'DELIVERY' && (
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {deliveryAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Pago y Total</p>
                  <p className="text-sm font-bold text-slate-800">{paymentMethod.replace('_', ' ')}</p>
                  <p className="text-lg font-black text-emerald-600 mt-1">Bs. {total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/profile#orders"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
              >
                Seguir mi pedido
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                onClick={onClose}
                className="w-full flex items-center justify-center py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm"
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
