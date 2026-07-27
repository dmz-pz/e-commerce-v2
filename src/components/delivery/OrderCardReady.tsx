import React from 'react';
import { motion } from 'motion/react';
import { Bike } from 'lucide-react';
import { Order } from '../../types/index.ts';

interface OrderCardReadyProps {
  order: Order;
  onTakeOrder: (orderId: string) => void;
}

export const OrderCardReady: React.FC<OrderCardReadyProps> = ({ order, onTakeOrder }) => {
  const paymentMethod = order.payment?.method || (order as any).paymentMethod;
  const isOnlinePayment = paymentMethod && paymentMethod !== 'EFECTIVO_DELIVERY' && paymentMethod !== 'PUNTO_DELIVERY';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border-2 border-dashed border-slate-250 rounded-[2rem] p-5 sm:p-6 hover:border-brand/40 transition-all flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-350 uppercase tracking-widest block">
              PEDIDO LISTO
            </span>
            <span className="text-[11px] font-mono text-slate-450 block uppercase tracking-wider font-bold">
              Ref: #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-accent text-brand text-[8px] font-black uppercase tracking-widest">
            Listo en Despacho
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Cliente Receptor</span>
          <div className="font-extrabold text-slate-800 text-sm">{order.customerName}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Sede de Despacho Principal</div>
        </div>

        {/* Info de pago rápida */}
        <div className="flex items-center justify-between py-3 px-1 border-t border-b border-slate-100 mb-6">
          <div>
            <span className="text-[8px] text-slate-400 font-bold uppercase block">Método</span>
            <span className="text-[11px] font-black text-brand uppercase">{order.payment?.method || (order as any).paymentMethod || 'Efectivo'}</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-slate-400 font-bold uppercase block">
              {isOnlinePayment ? 'Monto Total (Pagado)' : 'Monto a Cobrar'}
            </span>
            <span className="text-sm font-black text-slate-800 font-mono">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onTakeOrder(order.id)}
        className="mt-auto w-full flex items-center justify-center gap-2 py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-md shadow-brand/10 active:scale-95 cursor-pointer min-h-[52px]"
      >
        <Bike className="w-5 h-5" />
        Tomar Pedido
      </button>
    </motion.div>
  );
};
