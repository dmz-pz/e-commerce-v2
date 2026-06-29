import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Coins, Search, MessageCircle, CheckCircle2, 
  XCircle, ShoppingBag, ClipboardList 
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';

interface SalesTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onRefreshLogs?: () => void;
}

export const SalesTab: React.FC<SalesTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onRefreshLogs,
}) => {
  const [salesSearch, setSalesSearch] = useState('');
  const [salesFilter, setSalesFilter] = useState<'ALL' | 'pending' | 'picking' | 'ready' | 'delivered' | 'cancelled'>('ALL');

  // Filter orders according to status and query
  const filteredOrders = orders
    .filter(o => salesFilter === 'ALL' ? true : o.status === salesFilter)
    .filter(o => {
      const query = salesSearch.toLowerCase();
      return o.customerName.toLowerCase().includes(query) ||
             o.customerID.toLowerCase().includes(query) ||
             o.id.toLowerCase().includes(query) ||
             (o.customerPhone && o.customerPhone.includes(query));
    });

  // KPI calculations
  const totalCompletedAmount = orders
    .filter(o => o.status === OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + o.total, 0);

  const completedCount = orders.filter(o => o.status === OrderStatus.DELIVERED).length;

  const activeAmount = orders
    .filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + o.total, 0);

  const activeCount = orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length;

  const cancelledAmount = orders
    .filter(o => o.status === OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + o.total, 0);

  const cancelledCount = orders.filter(o => o.status === OrderStatus.CANCELLED).length;

  const cumulativeAmount = orders.reduce((sum, o) => sum + o.total, 0);

  // Status handler with alert popups
  const handleUpdateStatus = async (orderId: string, label: string, targetStatus: OrderStatus) => {
    if (window.confirm(`¿Desea marcar de forma manual esta orden como ${label}? Esto actualizará su estado inmediatamente.`)) {
      try {
        await onUpdateOrderStatus(orderId, targetStatus);
        if (onRefreshLogs) onRefreshLogs();
      } catch (err: any) {
        alert(err.message || 'No se pudo actualizar el estado de la orden');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="sales-panel"
      className="space-y-6 animate-fade-in"
      id="sales-tab-panel"
    >
      {/* KPIs de Ventas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Ventas Completadas</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${totalCompletedAmount.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium font-mono">USD</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{completedCount} pedidos entregados</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[9px] font-black text-brand uppercase tracking-wider block mb-1">Ventas Activas/Trámite</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${activeAmount.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium font-mono">USD</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-brand shrink-0" />
            <span>{activeCount} en preparación/camino</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block mb-1">Órdenes Canceladas</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${cancelledAmount.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium font-mono">USD</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{cancelledCount} pedidos anulados</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block mb-1">Monto Total Registrado</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${cumulativeAmount.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium font-mono">USD</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{orders.length} pedidos totales en tienda</span>
          </div>
        </div>
      </div>

      {/* Gráfico y Distribución de Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Tendencia SVG */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-brand" />
              Rendimiento de Ventas Diarias (Entregados)
            </h3>
            <p className="text-[10px] font-medium text-slate-400 mb-6">Monto facturado en USD por fecha de entrega</p>
          </div>

          {/* Renderizado del Gráfico vectorizado responsive */}
          <div className="overflow-x-auto no-scrollbar w-full pb-2">
            <div className="h-44 min-w-[500px] sm:min-w-0 flex items-end justify-between gap-2.5 px-2 relative border-b border-l border-slate-100 pb-2 pl-2">
              {(() => {
                const salesByDate: Record<string, number> = {};
                orders
                  .filter(o => o.status === OrderStatus.DELIVERED)
                  .forEach(o => {
                    const dateObj = new Date(o.createdAt);
                    const lbl = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                    salesByDate[lbl] = (salesByDate[lbl] || 0) + o.total;
                  });

                const labels = Object.keys(salesByDate);
                const values = Object.values(salesByDate);
                const maxVal = values.length > 0 ? Math.max(...values, 50) : 50;

                if (labels.length === 0) {
                  return (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6">
                      Esperando datos de pedidos entregados...
                    </div>
                  );
                }

                return labels.map((lbl) => {
                  const val = salesByDate[lbl] || 0;
                  const pct = (val / maxVal) * 80; // max high 80%
                  return (
                    <div key={lbl} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute bottom-[calc(100%-8px)] scale-0 group-hover:scale-100 transition-all font-mono text-[9px] font-bold bg-slate-900 text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                        ${val.toFixed(2)} USD
                      </div>
                      
                      {/* Columna */}
                      <div 
                        style={{ height: `${pct || 4}%` }} 
                        className="w-full bg-brand/10 group-hover:bg-brand/25 border-t-2 border-brand rounded-t-lg transition-all"
                      />
                      
                      {/* Fecha */}
                      <span className="text-[10px] font-mono font-bold text-slate-400 mt-2 rotate-12">{lbl}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Métodos de Pago más Utilizados */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-brand" />
              Popularidad de Métodos de Pago
            </h3>
            <p className="text-[10px] font-medium text-slate-400 mb-6 font-semibold">Pedidos totales por canal de cobro</p>
          </div>

          <div className="space-y-4">
            {(() => {
              const payMethods: Record<string, number> = {};
              orders.forEach(o => {
                const method = o.paymentMethod || 'No especificado';
                payMethods[method] = (payMethods[method] || 0) + 1;
              });

              const totalOrdersCount = orders.length || 1;

              return Object.entries(payMethods).map(([method, count]) => {
                const percent = (count / totalOrdersCount) * 100;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-600 uppercase tracking-tight">{method}</span>
                      <span className="text-slate-800 font-mono">{count} ped. ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className="h-full bg-brand rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Filtros, Buscador y Listado de Pedidos */}
      <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row items-center justify-between gap-4">
          {/* Selector de Filtros de Estado */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full no-scrollbar whitespace-nowrap gap-1 shrink-0">
            {(['ALL', 'pending', 'picking', 'ready', 'delivered', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSalesFilter(status)}
                className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  salesFilter === status 
                    ? 'bg-brand text-white shadow shadow-brand/10' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {status === 'ALL' ? 'Todos' :
                 status === 'pending' ? 'Recibidos' :
                 status === 'picking' ? 'Preparando' :
                 status === 'ready' ? 'Listos' :
                 status === 'delivered' ? 'Entregados' :
                 'Cancelados'}
              </button>
            ))}
          </div>

          {/* Input de Buscador */}
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por cliente, cédula, teléfono o ID..."
              className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all"
              value={salesSearch}
              onChange={(e) => setSalesSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Listado de Pedidos */}
        <div className="divide-y divide-slate-100">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-6 md:p-8 hover:bg-slate-50/20 transition-all">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">PEDIDO #{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      order.status === OrderStatus.PENDING ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      order.status === OrderStatus.PICKING ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      order.status === OrderStatus.READY ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      order.status === OrderStatus.DELIVERED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-rose-50 text-rose-500 border-rose-100'
                    }`}>
                      {order.status === OrderStatus.PENDING ? 'Pendiente / Recibido' :
                       order.status === OrderStatus.PICKING ? 'En Preparación' :
                       order.status === OrderStatus.READY ? 'Listo para entrega' :
                       order.status === OrderStatus.DELIVERED ? 'Entregado' :
                       'Cancelado / Anulado'}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 tracking-tight">{order.customerName}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <span>Cédula: <span className="text-slate-600 font-mono font-medium">{order.customerID}</span></span>
                    {order.customerPhone && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>Teléfono: <span className="text-slate-600 font-mono font-medium">{order.customerPhone}</span></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start lg:items-end shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-3">
                  <span className="text-xl font-black text-brand font-mono">${order.total.toFixed(2)}</span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{order.paymentMethod}</span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Listado de Artículos del pedido */}
              <div className="bg-slate-50/50 rounded-2xl p-4.5 border border-slate-100/70 mb-5 text-slate-550">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2.5">Artículos del Pedido ({order.items.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white p-3 rounded-xl border border-slate-150 shadow-sm">
                      <span className="font-bold text-slate-700 max-w-[170px] truncate">{item.name}</span>
                      <span className="font-mono font-bold text-brand bg-brand/5 px-2 py-0.5 rounded text-[10px] shrink-0">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción administrativa del pedido */}
              <div className="flex flex-wrap items-center gap-3">
                {order.customerPhone && (
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customerName}, te saluda el área de Administración de Minegocio sobre tu orden #${order.id.slice(0, 8).toUpperCase()}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 hover:bg-emerald-600 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-500" />
                    Contactar WhatsApp
                  </a>
                )}

                {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'ENTREGADA', OrderStatus.DELIVERED)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm border border-slate-900"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completar Orden (Fuerza)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'CANCELADA', OrderStatus.CANCELLED)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancelar Orden (Anular)
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="py-24 text-center text-slate-400">
              <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="font-bold text-base">No hay pedidos registrados en esta sección</p>
              <p className="text-xs text-slate-400 mt-1">Cuando los clientes compren o utilices un filtro diferente aparecerán aquí.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
