import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Bike, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useDeliveryDashboard } from '../hooks/useDeliveryDashboard.ts';
import { DeliveryHeader } from '../components/delivery/DeliveryHeader.tsx';
import { DeliveryTabs } from '../components/delivery/DeliveryTabs.tsx';
import { DeliveryBottomNav } from '../components/delivery/DeliveryBottomNav.tsx';
import { OrderCardActive } from '../components/delivery/OrderCardActive.tsx';
import { OrderCardReady } from '../components/delivery/OrderCardReady.tsx';
import { OrderCardHistory } from '../components/delivery/OrderCardHistory.tsx';
import { DeliveryActionModals } from '../components/delivery/DeliveryActionModals.tsx';
import { PaginationBar } from '../components/catalog/PaginationBar.tsx';

export const DeliveryDashboard: React.FC = () => {
  const dashboard = useDeliveryDashboard();

  if (dashboard.loading) {
    return (
      <div className="p-12 text-center font-mono text-brand animate-pulse">
        Inicializando terminal de rutas y entregas (Motorizado)...
      </div>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen pb-24 md:pb-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12">
        
        <DeliveryHeader 
          user={dashboard.user}
          cashInHand={dashboard.cashInHand}
          driverStatus={dashboard.driverStatus}
          onStatusChange={dashboard.handleStatusChange}
        />

        {dashboard.actionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl flex items-center gap-3 text-red-700 font-bold text-xs shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{dashboard.actionError}</span>
          </div>
        )}

        <DeliveryTabs 
          activeTab={dashboard.activeTab}
          setActiveTab={dashboard.setActiveTab}
          assignedCount={dashboard.assignedOrders.length}
          readyCount={dashboard.readyOrders.length}
          historyCount={dashboard.historyOrders.length}
          onRefresh={dashboard.loadOrders}
        />

        {/* --- GRID DE PEDIDOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            
            {dashboard.activeTab === 'assigned' && (
              dashboard.paginatedOrders.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
                  <Bike className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                    No tienes entregas asignadas actualmente
                  </p>
                  <button 
                    onClick={() => dashboard.setActiveTab('ready')}
                    className="mt-6 px-6 py-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer min-h-[44px]"
                  >
                    Ver Pedidos Listos para Entrega
                  </button>
                </div>
              ) : (
                dashboard.paginatedOrders.map((order) => (
                  <OrderCardActive 
                    key={order.id}
                    order={order}
                    onSetCancel={dashboard.setOrderToCancel}
                    onSetComplete={dashboard.setOrderToComplete}
                  />
                ))
              )
            )}

            {dashboard.activeTab === 'ready' && (
              dashboard.paginatedOrders.length === 0 ? (
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
                dashboard.paginatedOrders.map((order) => (
                  <OrderCardReady 
                    key={order.id}
                    order={order}
                    onTakeOrder={dashboard.handleTakeOrder}
                  />
                ))
              )
            )}

            {dashboard.activeTab === 'history' && (
              dashboard.paginatedOrders.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
                  <CheckCircle2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                    No has completado entregas en esta sesión
                  </p>
                </div>
              ) : (
                dashboard.paginatedOrders.map((order) => (
                  <OrderCardHistory 
                    key={order.id}
                    order={order}
                  />
                ))
              )
            )}

          </AnimatePresence>
        </div>

        {/* Barra de Paginación Inferior */}
        {dashboard.currentOrdersList.length > 0 && (
          <div className="mt-8 mb-4">
            <PaginationBar
              page={dashboard.page}
              totalPages={dashboard.totalPages}
              totalProducts={dashboard.totalProducts}
              limit={dashboard.limit}
              onPageChange={dashboard.setPage}
              onLimitChange={dashboard.setLimit}
              entityName="pedidos"
              limitOptions={[6, 12, 24, 48]}
            />
          </div>
        )}

      </div>

      <DeliveryBottomNav 
        activeTab={dashboard.activeTab}
        setActiveTab={dashboard.setActiveTab}
        assignedCount={dashboard.assignedOrders.length}
        readyCount={dashboard.readyOrders.length}
      />

      <DeliveryActionModals 
        orderToComplete={dashboard.orderToComplete}
        setOrderToComplete={dashboard.setOrderToComplete}
        executeCompleteDelivery={dashboard.executeCompleteDelivery}
        orderToCancel={dashboard.orderToCancel}
        setOrderToCancel={dashboard.setOrderToCancel}
        cancelReason={dashboard.cancelReason}
        setCancelReason={dashboard.setCancelReason}
        executeCancelDelivery={dashboard.executeCancelDelivery}
        isSubmitting={dashboard.isSubmitting}
      />

    </main>
  );
};
