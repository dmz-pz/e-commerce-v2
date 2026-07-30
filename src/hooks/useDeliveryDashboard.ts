import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types/index.ts';
import { useUser } from '../context/UserContext.tsx';
import { orderService } from '../services/orderService.ts';

export const useDeliveryDashboard = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline'>('offline');
  const [cashInHand, setCashInHand] = useState(0);
  const [activeTab, setActiveTab] = useState<'assigned' | 'ready' | 'history'>('assigned');
  const [actionError, setActionError] = useState<string | null>(null);

  // Modales custom
  const [orderToComplete, setOrderToComplete] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para paginación de pedidos
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // Carga inicial de datos desde el backend
  const loadOrders = async () => {
    try {
      const allOrders = await orderService.getOrders();
      setOrders(allOrders || []);
    } catch (err) {
      console.error("Error al cargar órdenes de reparto:", err);
    }
  };

  const loadDriverProfile = async () => {
    try {
      const profile = await orderService.getDriverProfile();
      if (profile) {
        setDriverStatus((profile.status as 'available' | 'busy' | 'offline') || 'offline');
        setCashInHand(profile.cashInHand ?? 0);
      }
    } catch (err) {
      console.error("Error al cargar perfil del repartidor:", err);
    }
  };

  const initDashboard = async () => {
    setLoading(true);
    await Promise.all([loadOrders(), loadDriverProfile()]);
    setLoading(false);
  };

  useEffect(() => {
    initDashboard();

    // Polling cada 10s para actualizar las órdenes en ruta y caja
    const interval = setInterval(async () => {
      await Promise.all([loadOrders(), loadDriverProfile()]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (status: 'available' | 'busy' | 'offline') => {
    try {
      setDriverStatus(status);
      await orderService.updateDriverStatus(status);
    } catch (err) {
      console.error("Error al actualizar estado del repartidor:", err);
    }
  };

  // Auto-asignación de pedido al repartidor en sesión
  const handleTakeOrder = async (orderId: string) => {
    if (!user) return;
    try {
      setActionError(null);
      await orderService.assignDeliveryPerson(orderId, user.id);
      // Removido para permitir asignación múltiple consecutiva (Rutas Múltiples)
      // await handleStatusChange('busy');
      await Promise.all([loadOrders(), loadDriverProfile()]);
      setActiveTab('assigned');
    } catch (error) {
      const err = error as Error;
      console.error("Error al tomar orden:", err);
      setActionError("No se pudo iniciar el reparto. Intente nuevamente.");
    }
  };

  // Finalizar entrega en destino (Transición a DELIVERED en DB)
  const executeCompleteDelivery = async () => {
    if (!orderToComplete) return;
    setIsSubmitting(true);
    try {
      setActionError(null);
      await orderService.updateOrderStatus(orderToComplete.id, OrderStatus.DELIVERED);
      await loadOrders();
      await loadDriverProfile();
      
      const activeCount = orders.filter(o => {
        const activeJob = o.deliveryJobs?.[0];
        return activeJob?.deliveryPersonId === user?.id && 
               activeJob?.status !== 'COMPLETED' && 
               activeJob?.status !== 'FAILED' &&
               o.status !== OrderStatus.DELIVERED &&
               o.status !== OrderStatus.CANCELLED;
      }).length;
      if (activeCount <= 1) {
        await handleStatusChange('available');
      }
      setOrderToComplete(null);
    } catch (error) {
      const err = error as Error;
      console.error("Error al completar entrega:", err);
      setActionError("No se pudo marcar la entrega como completada.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar o reportar pedido en ruta (Retornar a READY_TO_PAY)
  const executeCancelDelivery = async () => {
    if (!orderToCancel || !cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      setActionError(null);
      await orderService.updateOrderStatus(orderToCancel.id, OrderStatus.READY_TO_PAY, cancelReason);
      await loadOrders();
      await loadDriverProfile();

      const activeCount = orders.filter(o => {
        const activeJob = o.deliveryJobs?.[0];
        return activeJob?.deliveryPersonId === user?.id && 
               activeJob?.status !== 'COMPLETED' && 
               activeJob?.status !== 'FAILED' &&
               o.status !== OrderStatus.DELIVERED &&
               o.status !== OrderStatus.CANCELLED;
      }).length;
      if (activeCount <= 1) {
        await handleStatusChange('available');
      }
      setOrderToCancel(null);
      setCancelReason("");
    } catch (err) {
      console.error("Error al retornar entrega:", err);
      setActionError("Error al reportar ruta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado dinámico de pedidos
  const assignedOrders = orders.filter(o => {
    const activeJob = o.deliveryJobs?.[0];
    return activeJob?.deliveryPersonId === user?.id && 
           activeJob?.status !== 'COMPLETED' && 
           activeJob?.status !== 'FAILED' &&
           o.status !== OrderStatus.DELIVERED &&
           o.status !== OrderStatus.CANCELLED;
  });

  const readyOrders = orders.filter(o => 
    (o.status === OrderStatus.READY_TO_PAY || o.status === OrderStatus.PAID) && 
    (!o.deliveryJobs || o.deliveryJobs.length === 0 || o.deliveryJobs[0]?.status === 'FAILED')
  );

  const historyOrders = orders.filter(o => {
    const activeJob = o.deliveryJobs?.[0];
    return activeJob?.deliveryPersonId === user?.id &&
           activeJob?.status === 'COMPLETED' &&
           o.status === OrderStatus.DELIVERED;
  });

  // Comentado para permitir que el repartidor se mantenga 'available' en tienda
  // y solo pase a 'busy' manualmente al salir a entregar las rutas.
  // useEffect(() => {
  //   if (assignedOrders.length > 0 && driverStatus === 'available') {
  //     handleStatusChange('busy');
  //   }
  // }, [assignedOrders.length, driverStatus]);

  const currentOrdersList = activeTab === 'assigned' ? assignedOrders : activeTab === 'ready' ? readyOrders : historyOrders;
  const totalPages = Math.max(1, Math.ceil(currentOrdersList.length / limit));
  
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedOrders = currentOrdersList.slice((page - 1) * limit, page * limit);

  return {
    user,
    loading,
    driverStatus,
    cashInHand,
    activeTab,
    setActiveTab,
    actionError,
    
    // Pagination
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalProducts: currentOrdersList.length,
    paginatedOrders,
    
    // Lists
    assignedOrders,
    readyOrders,
    historyOrders,
    currentOrdersList,
    
    // Actions
    loadOrders,
    handleStatusChange,
    handleTakeOrder,
    executeCompleteDelivery,
    executeCancelDelivery,
    
    // Modals state
    orderToComplete,
    setOrderToComplete,
    orderToCancel,
    setOrderToCancel,
    cancelReason,
    setCancelReason,
    isSubmitting
  };
};
