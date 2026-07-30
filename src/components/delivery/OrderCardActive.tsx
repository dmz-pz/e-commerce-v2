import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, MapPin, CreditCard, MessageCircle, Navigation, AlertTriangle, Check } from 'lucide-react';
import { Order } from '../../types/index.ts';

interface OrderCardActiveProps {
  order: Order;
  onSetCancel: (order: Order) => void;
  onSetComplete: (order: Order) => void;
}

export const OrderCardActive: React.FC<OrderCardActiveProps> = ({ order, onSetCancel, onSetComplete }) => {
  const clientAddress = order.deliveryAddress || 'Dirección de envío del cliente';
  const paymentMethod = order.payment?.method || (order as unknown as { paymentMethod?: string }).paymentMethod;
  const isOnlinePayment = paymentMethod && paymentMethod !== 'EFECTIVO_DELIVERY' && paymentMethod !== 'PUNTO_DELIVERY';
  const paymentDisplay = paymentMethod || 'Efectivo / En Entrega';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-slate-250/80 rounded-[2rem] p-5 sm:p-6 hover:shadow-[0_20px_50px_rgba(0,51,153,0.06)] transition-all flex flex-col justify-between h-full"
    >
      <div>
        {/* Header Ficha */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-350 uppercase tracking-widest block mb-0.5">
              ID: {order.id.slice(0, 8).toUpperCase()}
            </span>
            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
              {order.customerName}
            </h3>
          </div>
          <div className="px-3.5 py-1 rounded-full bg-brand/5 border border-brand/10 text-brand text-[8px] font-black uppercase tracking-widest">
            En Tránsito
          </div>
        </div>

        {/* Ficha rápida cliente */}
        <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-205/60 mb-5">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Contacto: {order.customerPhone || 'No indica'}</span>
          </div>
          
          <div className="flex items-start gap-2 text-[10px] font-medium text-slate-600 border-t border-slate-200/50 pt-2">
            <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-400 text-[8px] uppercase tracking-wider block">Destino de entrega:</span>
              <p className="text-slate-800 leading-relaxed font-bold">{clientAddress}</p>
            </div>
          </div>
        </div>

        {/* Lista de ítemes simplificada */}
        <div className="mb-5 space-y-1.5 border-b border-slate-100 pb-4">
          <span className="text-[8px] font-mono font-bold text-slate-300 block uppercase tracking-wider mb-2">Artículos para entrega:</span>
          {order.items.map((it, idx) => (
            <div key={idx} className="flex justify-between text-[11px] font-bold text-slate-700">
              <span className="truncate max-w-[200px]">
                <span className="text-brand mr-1 font-black">{it.requestedQuantity ?? it.quantity ?? 1}x</span> {it.name}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">${Number(it.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Facturación y Acciones Rápidas */}
      <div className="mt-auto">
        {/* Importes */}
        <div className="flex items-center justify-between mb-5 px-1 bg-brand/5 p-3 rounded-xl border border-brand/10">
          <div>
            <span className="text-[8px] font-black text-brand uppercase tracking-widest block leading-none mb-1">
              {isOnlinePayment ? 'Pagado Online' : 'Cobro en Destino'}
            </span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <CreditCard className="w-3.5 h-3.5 text-brand" />
              <span className="text-[10px] font-black uppercase">{paymentDisplay}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Monto Total</span>
            <span className="text-xl font-black text-brand font-mono">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Panel de Botones de Control */}
        <div className="space-y-3">
          {/* Botón WhatsApp de Cliente */}
          {order.customerPhone && (
            <a
              href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hola ${order.customerName}, le saluda su motorizado de Minegocio. Estoy en ruta hacia su dirección con su pedido de $${Number(order.total).toFixed(2)}. Me confirma si se encuentra activo por favor.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-md shadow-emerald-500/10 cursor-pointer min-h-[48px]"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-500" />
              WhatsApp
            </a>
          )}

          {/* Abrir en mapas simulado */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clientAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl text-[11px] uppercase tracking-widest transition-all border border-slate-200 cursor-pointer min-h-[48px]"
          >
            <Navigation className="w-4 h-4 text-brand" />
            Ver en Google Maps
          </a>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 mt-2">
            {/* Reportar Devolución */}
            <button
              onClick={() => onSetCancel(order)}
              className="py-3 px-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200/50 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[48px]"
            >
              <AlertTriangle className="w-4 h-4" />
              Problema
            </button>

            {/* Entregado Exitosamente */}
            <button
              onClick={() => onSetComplete(order)}
              className="py-3 px-3 bg-brand hover:bg-brand-dark text-white shadow-md shadow-brand/10 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[48px]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Entregado
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
