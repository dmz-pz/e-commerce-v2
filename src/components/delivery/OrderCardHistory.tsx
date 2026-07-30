import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Order } from '../../types/index.ts';

interface OrderCardHistoryProps {
  order: Order;
}

export const OrderCardHistory: React.FC<OrderCardHistoryProps> = ({ order }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-green-200 rounded-[2rem] p-5 sm:p-6 hover:shadow-sm opacity-80 h-full flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[9px] font-mono font-bold text-slate-350 uppercase tracking-widest block">
            ENTREGADO EN DESTINO
          </span>
          <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{order.customerName}</h4>
        </div>
        <div className="w-8 h-8 bg-green-50 border border-green-100 rounded-full flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-green-600 stroke-[3]" />
        </div>
      </div>

      <div className="mt-auto bg-green-50/45 border border-green-100/50 p-4 rounded-xl flex justify-between items-center text-[10px] font-bold text-slate-600">
        <div>
          <span className="text-[8px] text-green-700/60 font-black uppercase tracking-widest block">Liquidado</span>
          <span className="font-black text-brand uppercase">{order.payment?.method || (order as unknown as { paymentMethod?: string }).paymentMethod || 'Efectivo'}</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-green-700/60 font-black uppercase tracking-widest block">Monto Entregado</span>
          <span className="font-mono font-black text-brand text-sm">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
};
