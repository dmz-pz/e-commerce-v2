import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, CheckCircle2, Smartphone, CreditCard, IdCard, Bike, Check, 
  MessageCircle, Trash2, RefreshCw, AlertTriangle, Minus, Plus 
} from 'lucide-react';
import { Order, OrderStatus, DeliveryPerson } from '../../types/index.ts';

interface OrderCardProps {
  order: Order;
  availableMotorizados: DeliveryPerson[];
  modifyingOrderId: string | null;
  errorMessage: string | null;
  assigningId: string | null;
  isDirty?: boolean;
  setAssigningId: (id: string | null) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onAssignDelivery: (orderId: string, motorizadoId: string) => Promise<void>;
  onUpdateItemQuantity: (orderId: string, productId: string, delta: number) => void;
  onRemoveItem: (orderId: string, productId: string) => void;
  onSaveOrderItems?: (orderId: string) => Promise<void>;
  onDiscardOrderChanges?: (orderId: string) => void;
  onSetSubstitutingItem: (item: { orderId: string, productId: string, name: string } | null) => void;
  onOpenCancelModal?: (orderId: string, customerName: string) => void;
}

const getStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return {
        cardBg: 'bg-gradient-to-br from-orange-50/30 to-amber-50/10 border-orange-100/70 hover:border-orange-200 hover:shadow-[0_20px_50px_rgba(249,115,22,0.05)]',
        topAccent: 'bg-orange-500',
      };
    case OrderStatus.PICKING:
      return {
        cardBg: 'bg-gradient-to-br from-blue-50/20 to-brand/[0.01] border-blue-100/70 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(0,51,153,0.06)]',
        topAccent: 'bg-brand',
      };
    case OrderStatus.READY_TO_PAY:
      return {
        cardBg: 'bg-gradient-to-br from-purple-50/20 to-indigo-50/10 border-purple-100/70 hover:border-purple-200 hover:shadow-[0_20px_50px_rgba(168,85,247,0.05)]',
        topAccent: 'bg-purple-500',
      };
    case OrderStatus.PAID:
      return {
        cardBg: 'bg-gradient-to-br from-emerald-50/20 to-teal-50/10 border-emerald-100/70 hover:border-emerald-200 hover:shadow-[0_20px_50px_rgba(16,185,129,0.05)]',
        topAccent: 'bg-emerald-500',
      };
    case OrderStatus.CANCELLED:
      return {
        cardBg: 'bg-gradient-to-br from-red-50/10 to-slate-50/20 border-red-100/60 hover:border-red-200 hover:shadow-[0_20px_50px_rgba(239,68,68,0.03)]',
        topAccent: 'bg-red-400',
      };
    default:
      return {
        cardBg: 'bg-white border-slate-200 hover:shadow-[0_20px_50px_rgba(0,51,153,0.08)]',
        topAccent: 'bg-slate-300',
      };
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  availableMotorizados,
  modifyingOrderId,
  errorMessage,
  assigningId,
  isDirty = false,
  setAssigningId,
  onUpdateStatus,
  onAssignDelivery,
  onUpdateItemQuantity,
  onRemoveItem,
  onSaveOrderItems,
  onDiscardOrderChanges,
  onSetSubstitutingItem,
  onOpenCancelModal,
}) => {
  const isModifyingThisOrder = modifyingOrderId === order.id;
  const styles = getStatusStyles(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${styles.cardBg} border rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 transition-all group relative overflow-hidden flex flex-col`}
    >
      {/* Barra de acento de estado en la parte superior */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.topAccent}`} />
      {/* Header and status badge */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-300 block mb-1 uppercase tracking-widest">
            ID PEDIDO: {order.id.slice(0, 8)}
          </span>
          <h3 className="font-bold text-slate-900 text-lg tracking-tight">{order.customerName}</h3>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          order.status === OrderStatus.PENDING ? 'bg-orange-50 text-orange-600 border-orange-100' :
          order.status === OrderStatus.PICKING ? 'bg-brand/5 text-brand border-brand/10' :
          order.status === OrderStatus.READY_TO_PAY ? 'bg-purple-50 text-purple-600 border-purple-100' :
          order.status === OrderStatus.PAID ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          order.status === OrderStatus.CANCELLED ? 'bg-red-50 text-red-600 border-red-100' :
          'bg-green-50 text-green-600 border-green-100'
        }`}>
          {order.status === OrderStatus.PENDING ? 'Pendiente' : 
           order.status === OrderStatus.PICKING ? 'En Preparación' : 
           order.status === OrderStatus.READY_TO_PAY ? 'Listo p/ Pagar' : 
           order.status === OrderStatus.PAID ? 'Pagado' : 
           order.status === OrderStatus.CANCELLED ? 'Cancelado' : 'Enviado'}
        </div>
      </div>

      {/* Customer Contact & Billing Details */}
      <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <IdCard className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-600 uppercase">{order.cedula || order.customerId || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-600 uppercase">{order.customerPhone || 'N/A'}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-slate-200/50">
          <CreditCard className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-black text-brand uppercase tracking-wider">
            {order.payment?.method || (order as any).paymentMethod || 'Efectivo / En Entrega'}
          </span>
        </div>
      </div>

      {/* WhatsApp Picker Contact Button */}
      {order.customerPhone && (
        <a
          href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Hola ${order.customerName}, te saluda el picker de Minegocio. Estoy preparando tu pedido #${order.id.slice(0, 8)}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex items-center justify-center gap-2.5 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-2xl text-[10px] uppercase tracking-[0.15em] transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 text-center cursor-pointer"
          id={`wa-btn-${order.id}`}
        >
          <MessageCircle className="w-4 h-4 fill-white text-emerald-500" />
          Contactar por WhatsApp
        </a>
      )}

      {/* Local Order Error Alert */}
      {errorMessage && isModifyingThisOrder && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-[10px] font-bold tracking-tight">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 fill-red-100" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Items Section */}
      <div className="space-y-3 mb-8 flex-1">
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 block">
          Artículos ({order.items.length})
        </span>
        
        {order.items.map((item, idx) => {
          const canEdit = !order.deliveryPersonId && (order.status === OrderStatus.PENDING || order.status === OrderStatus.PICKING);
          return (
            <div key={idx} className="flex flex-col gap-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:border-brand/10 transition-all shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-brand/5 text-brand rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">
                    {item.requestedQuantity ?? (item as any).quantity ?? 1}
                  </div>
                  <span className="text-slate-700 font-bold text-xs tracking-tight leading-snug">{item.name}</span>
                </div>
                <span className="text-slate-500 font-mono font-medium text-xs shrink-0">
                  ${Number(item.price).toFixed(2)}
                </span>
              </div>
              
              {/* Picking and Substitution controls */}
              {canEdit && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-100/50 mt-1">
                  {/* Quantity adjustment buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateItemQuantity(order.id, item.productId, -1)}
                      disabled={isModifyingThisOrder}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand hover:border-brand/20 flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer"
                      title="Reducir cantidad"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-600 w-4 text-center">
                      {item.requestedQuantity ?? (item as any).quantity ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateItemQuantity(order.id, item.productId, 1)}
                      disabled={isModifyingThisOrder}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand hover:border-brand/20 flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer"
                      title="Aumentar cantidad"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Substitution and deletion triggers */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSetSubstitutingItem({ orderId: order.id, productId: item.productId, name: item.name })}
                      disabled={isModifyingThisOrder}
                      className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-brand bg-white border border-slate-200 hover:border-brand/20 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                      title="Sustituir producto"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Sustituir
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(order.id, item.productId)}
                      disabled={isModifyingThisOrder}
                      className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100/50 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-6 border-t border-slate-100 flex justify-between items-center px-2">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Total Facturado</span>
          <span className="text-2xl font-black text-brand font-mono leading-none">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons for Operating workflow */}
      <div className="flex flex-col gap-3">
        {order.status === OrderStatus.PENDING && !order.deliveryPersonId && (
          <button 
            type="button"
            onClick={() => onUpdateStatus(order.id, OrderStatus.PICKING)}
            className="w-full bg-brand text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-dark transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand/20 active:scale-95 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-accent" />
            Iniciar Preparación (Picking)
          </button>
        )}
        
        {order.status === OrderStatus.PICKING && !order.deliveryPersonId && (
          <button 
            type="button"
            onClick={() => onUpdateStatus(order.id, OrderStatus.READY_TO_PAY)}
            className="w-full bg-accent text-brand py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-dark transition-all flex items-center justify-center gap-3 shadow-lg shadow-accent/20 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Terminar y Marcar Listo p/ Pagar
          </button>
        )}

        {/* Cancel Order Trigger Button for active editable orders */}
        {!order.deliveryPersonId && order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
          <button
            type="button"
            onClick={() => onOpenCancelModal?.(order.id, order.customerName)}
            disabled={isModifyingThisOrder}
            className="w-full py-2.5 px-4 bg-red-50/50 hover:bg-red-50 text-red-600 border border-red-100 hover:border-red-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
            Cancelar Orden
          </button>
        )}

        {(order.status === OrderStatus.READY_TO_PAY || order.status === OrderStatus.PAID) && !order.deliveryPersonId && !assigningId && (
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col gap-3">
            <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
              <Bike className="w-3 h-3" /> Requiere Asignación de Motorizado
            </span>
            <button 
              type="button"
              onClick={() => setAssigningId(order.id)}
              className="w-full bg-brand text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all cursor-pointer"
            >
              Asignar Repartidor
            </button>
          </div>
        )}

        {assigningId === order.id && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-brand/20 rounded-2xl p-4 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">Motorizados Disponibles</span>
              <button 
                type="button" 
                onClick={() => setAssigningId(null)} 
                className="text-[9px] font-bold text-slate-400 hover:text-brand underline cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {availableMotorizados.length === 0 ? (
                <div className="text-center py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  No hay repartidores libres
                </div>
              ) : availableMotorizados.map(motorizado => (
                <button
                  type="button"
                  key={motorizado.id}
                  onClick={() => onAssignDelivery(order.id, motorizado.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand/5 border border-slate-100 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 bg-brand/5 rounded-full flex items-center justify-center group-hover:bg-brand transition-colors">
                    <Bike className="w-4 h-4 text-brand group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-[11px] leading-none mb-1">{motorizado.name}</div>
                    <div className="text-[9px] text-slate-400 font-mono">{motorizado.vehicle}</div>
                  </div>
                  <Check className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {order.deliveryPersonId && order.status !== OrderStatus.DELIVERED && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bike className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block mb-0.5">En Reparto</span>
              <span className="text-[10px] font-black text-slate-700 uppercase">
                En ruta con: {order.deliveryPerson ? `${order.deliveryPerson.firstName} ${order.deliveryPerson.lastName}` : 'Motorizado'}
              </span>
            </div>
          </div>
        )}

        {order.status === OrderStatus.DELIVERED && (
          <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest block mb-0.5">Pedido Entregado</span>
              <span className="text-[10px] font-black text-slate-700 uppercase">El cliente ya recibió su compra</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
