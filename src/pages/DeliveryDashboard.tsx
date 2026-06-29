import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bike, Clock, Check, Smartphone, MapPin, CreditCard, MessageCircle, 
  RefreshCw, CheckCircle2, Navigation, ShoppingBag, ShieldAlert, AlertTriangle 
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { useUser } from '../context/UserContext.tsx';
import { orderService } from '../services/orderService.ts';
import { Logo } from '../components/Logo.tsx';

// Direcciones simuladas fijas por ID de Orden para realismo absoluto
const MOCK_ADDRESSES: Record<string, string> = {
  'ord-8421': 'Av. Principal de Las Mercedes, Edif. Parque, Torre B, Apto 4A. Punto de referencia: Al lado de la Plaza.',
  'ord-1255': 'Calle París con Monterrey, Residencias Altamira, Piso 10, Apto 10-C, Las Mercedes.',
  'default_1': 'Av. Francisco de Miranda, Edificio торре provincial, Piso 4, Oficina 4-B, Chacao.',
  'default_2': 'Urb. La Castellana, Av. Principal, Res. El Bosque, Casa Nro 12, Chacao.',
  'default_3': 'Tercera transversal de Altamira, entre avenidas San Juan Bosco y Luis Roche, Res. Altamira, Apto 5B.',
};

const getSimulatedAddress = (orderId: string): string => {
  if (MOCK_ADDRESSES[orderId]) return MOCK_ADDRESSES[orderId];
  // Generar dinámica pero determinista
  const sum = orderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const defaults = [MOCK_ADDRESSES.default_1, MOCK_ADDRESSES.default_2, MOCK_ADDRESSES.default_3];
  return defaults[sum % defaults.length];
};

export const DeliveryDashboard: React.FC = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline'>('available');
  const [activeTab, setActiveTab] = useState<'assigned' | 'ready' | 'history'>('assigned');
  
  // Guardaremos compras terminadas localmente para aislar el historial por sesión de delivery
  const [completedOrderIds, setCompletedOrderIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  // Carga inicial de datos
  const loadOrders = async () => {
    try {
      const allOrders = await orderService.getOrders();
      setOrders(allOrders || []);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar órdenes de reparto:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Leer entregas completadas desde localStorage
    const savedCompleted = localStorage.getItem('completed_deliveries_session');
    if (savedCompleted) {
      setCompletedOrderIds(JSON.parse(savedCompleted));
    }

    // Polling cada 12s
    const interval = setInterval(() => {
      loadOrders();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Guardar en localStorage
  const saveCompletedOrders = (updatedList: string[]) => {
    setCompletedOrderIds(updatedList);
    localStorage.setItem('completed_deliveries_session', JSON.stringify(updatedList));
  };

  // Auto-asignación de pedido
  const handleTakeOrder = async (orderId: string) => {
    if (!user) return;
    try {
      setActionError(null);
      // Asigna el repartidor (esto cambia estado a DELIVERED en el backend mock)
      await orderService.assignDeliveryPerson(orderId, user.id);
      await loadOrders();
      setActiveTab('assigned');
      
      // Opcional: Cambiar estado a ocupado si toma un pedido
      setDriverStatus('busy');
    } catch (err: any) {
      console.error("Error al tomar orden:", err);
      setActionError("No se pudo iniciar el reparto. Intente nuevamente.");
    }
  };

  // Finalizar entrega en destino
  const handleCompleteDelivery = (orderId: string) => {
    // Agregamos al listado de completados local
    const updated = [...completedOrderIds, orderId];
    saveCompletedOrders(updated);
    
    // Si no quedan pedidos activos, volver a disponible
    const stillActive = orders.some(o => 
      o.deliveryPersonId === user?.id && 
      o.status === OrderStatus.DELIVERED && 
      !updated.includes(o.id)
    );
    if (!stillActive) {
      setDriverStatus('available');
    }
  };

  // Cancelar o regresar pedido
  const handleCancelDelivery = async (orderId: string) => {
    const reason = window.prompt("Por favor, ingresa el motivo del reporte/devolución (ej. Cliente no responde, Dirección incorrecta):");
    if (reason === null) return; // Cancelado por el usuario
    
    try {
      setActionError(null);
      // Regresamos el pedido al picker como READY (listo para reasociar repartidor) o CANCELLED
      await orderService.updateOrderStatus(orderId, OrderStatus.READY);
      await loadOrders();
    } catch (err) {
      console.error("Error al retornar entrega:", err);
      setActionError("Error al reportar ruta.");
    }
  };

  // Filtrar Pedidos
  // 1. Asignados En Ruta (Asociados a este motorizado, no marcados como completados localmente)
  const assignedOrders = orders.filter(o => 
    o.deliveryPersonId === user?.id && 
    o.status === OrderStatus.DELIVERED &&
    !completedOrderIds.includes(o.id)
  );

  // 2. Listos para despacho global (disponibles para auto-asignarse)
  const readyOrders = orders.filter(o => 
    o.status === OrderStatus.READY && 
    (!o.deliveryPersonId)
  );

  // 3. Historial de entregas concluidas
  const historyOrders = orders.filter(o => 
    completedOrderIds.includes(o.id)
  );

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-brand animate-pulse">
        Inicializando terminal de rutas y entregas (Motorizado)...
      </div>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12">
        
        {/* Header de Repartidor */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 border-b border-slate-200/60 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 text-brand font-mono text-[10px] font-black uppercase tracking-[0.3em]">
              <Logo className="w-8 h-8" />
              Terminal de Repartidores
            </div>
            <h1 className="text-3xl font-light text-slate-900 tracking-tight">
              Control de <span className="font-bold text-brand">Entregas Urbanas</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Conectado como: <span className="text-slate-800 font-bold">{user?.name || "Repartidor Independiente"}</span></p>
          </div>

          {/* Quick Status Pill selector */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest pl-3 pr-2">Estado:</span>
            
            <button 
              onClick={() => setDriverStatus('available')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                driverStatus === 'available' 
                  ? 'bg-green-550 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${driverStatus === 'available' ? 'bg-white' : 'bg-green-550'} inline-block`} />
              Disponible
            </button>

            <button 
              onClick={() => setDriverStatus('busy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                driverStatus === 'busy' 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${driverStatus === 'busy' ? 'bg-white' : 'bg-orange-500'} inline-block`} />
              En Ruta
            </button>

            <button 
              onClick={() => setDriverStatus('offline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                driverStatus === 'offline' 
                  ? 'bg-slate-500 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${driverStatus === 'offline' ? 'bg-white' : 'bg-slate-500'} inline-block`} />
              Desconectado
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {actionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl flex items-center gap-3 text-red-700 font-bold text-xs shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Navigation Tabs and Refresh Button */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'assigned' 
                  ? 'bg-brand text-white shadow-md shadow-brand/10' 
                  : 'text-slate-500 hover:text-brand hover:bg-slate-50'
              }`}
            >
              <Bike className="w-4 h-4" />
              Mis Rutas Activas ({assignedOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('ready')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'ready' 
                  ? 'bg-brand text-white shadow-md shadow-brand/10' 
                  : 'text-slate-500 hover:text-brand hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Pedidos Listos ({readyOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-brand text-white shadow-md shadow-brand/10' 
                  : 'text-slate-500 hover:text-brand hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Historial ({historyOrders.length})
            </button>
          </div>

          {/* Refresh Action */}
          <button 
            onClick={loadOrders}
            className="flex items-center justify-center gap-2 px-5 h-12 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-500 hover:text-brand font-bold text-[10px] uppercase tracking-wider cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refrescar Rutas
          </button>
        </div>

        {/* --- GRID DE PEDIDOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            
            {/* TAB 1: RUTA ACTIVA */}
            {activeTab === 'assigned' && (
              assignedOrders.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
                  <Bike className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                    No tienes entregas asignadas actualmente
                  </p>
                  <button 
                    onClick={() => setActiveTab('ready')}
                    className="mt-4 px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-[9px] uppercase font-black tracking-widest transition-all cursor-pointer"
                  >
                    Ver Pedidos Listos para Entrega
                  </button>
                </div>
              ) : (
                assignedOrders.map((order) => {
                  const clientAddress = getSimulatedAddress(order.id);
                  return (
                    <motion.div
                      layout
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border border-slate-250/80 rounded-[2rem] p-6 hover:shadow-[0_20px_50px_rgba(0,51,153,0.06)] transition-all flex flex-col justify-between"
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
                                <span className="text-brand mr-1 font-black">{it.quantity}x</span> {it.name}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">${it.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Facturación y Acciones Rápidas */}
                      <div>
                        {/* Importes */}
                        <div className="flex items-center justify-between mb-5 px-1 bg-brand/5 p-3 rounded-xl border border-brand/10">
                          <div>
                            <span className="text-[8px] font-black text-brand uppercase tracking-widest block leading-none mb-1">Cobro en Destino</span>
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <CreditCard className="w-3.5 h-3.5 text-brand" />
                              <span className="text-[10px] font-black uppercase">{order.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Monto Total</span>
                            <span className="text-xl font-black text-brand font-mono">${order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Panel de Botones de Control */}
                        <div className="space-y-2">
                          {/* Botón WhatsApp de Cliente */}
                          {order.customerPhone && (
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hola ${order.customerName}, le saluda su motorizado de Minegocio. Estoy en ruta hacia su dirección con su pedido de $${order.total.toFixed(2)}. Me confirma si se encuentra activo por favor.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-500" />
                              Chatear por Whatsapp
                            </a>
                          )}

                          {/* Abrir en mapas simulado */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clientAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl text-[10px] uppercase tracking-widest transition-all border border-slate-200 cursor-pointer"
                          >
                            <Navigation className="w-3.5 h-3.5 text-brand" />
                            Navegar en Google Maps
                          </a>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            {/* Reportar Devolución */}
                            <button
                              onClick={() => handleCancelDelivery(order.id)}
                              className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200/50 font-black rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                              title="Reportar devolución o problema"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Problema
                            </button>

                            {/* Entregado Exitosamente */}
                            <button
                              onClick={() => handleCompleteDelivery(order.id)}
                              className="py-2.5 px-3 bg-brand hover:bg-brand-dark text-white shadow-md shadow-brand/10 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              Entregado
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )
            )}

            {/* TAB 2: PEDIDOS LISTOS PARA AUTO-ASIGNACIÓN */}
            {activeTab === 'ready' && (
              readyOrders.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
                  <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                    No hay pedidos listos para auto-asignarse.
                  </p>
                  <p className="text-slate-350 text-[10px] mt-1 font-medium max-w-md mx-auto">
                    Los pickers se encuentran preparando las órdenes activas en el nodo de control.
                  </p>
                </div>
              ) : (
                readyOrders.map((order) => (
                  <motion.div
                    layout
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border-2 border-dashed border-slate-250 rounded-[2rem] p-6 hover:border-brand/40 transition-all flex flex-col justify-between"
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
                          <span className="text-[11px] font-black text-brand uppercase">{order.paymentMethod}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-400 font-bold uppercase block">Monto a Cobrar</span>
                          <span className="text-sm font-black text-slate-800 font-mono">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTakeOrder(order.id)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-md shadow-brand/10 active:scale-95 cursor-pointer"
                    >
                      <Bike className="w-4 h-4" />
                      Iniciar Reparto
                    </button>
                  </motion.div>
                ))
              )
            )}

            {/* TAB 3: HISTORIAL DE ENTREGAS CONCLUIDAS */}
            {activeTab === 'history' && (
              historyOrders.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
                  <CheckCircle2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                    No has completado entregas en esta sesión
                  </p>
                </div>
              ) : (
                historyOrders.map((order) => (
                  <motion.div
                    layout
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-green-200 rounded-[2rem] p-6 hover:shadow-sm opacity-80"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-350 uppercase tracking-widest block">
                          ENTREGADO EN DESTINO
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{order.customerName}</h4>
                      </div>
                      <div className="w-7 h-7 bg-green-50 border border-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600 stroke-[3]" />
                      </div>
                    </div>

                    <div className="bg-green-50/45 border border-green-100/50 p-3 rounded-xl flex justify-between items-center text-[10px] font-bold text-slate-600">
                      <div>
                        <span className="text-[8px] text-green-700/60 font-black uppercase tracking-widest block">Liquidado</span>
                        <span className="font-black text-brand uppercase">{order.paymentMethod}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-green-700/60 font-black uppercase tracking-widest block">Monto Entregado</span>
                        <span className="font-mono font-black text-brand text-xs">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            )}

          </AnimatePresence>
        </div>

      </div>
    </main>
  );
};
