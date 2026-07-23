import React, { useEffect, useState } from 'react';
import { Order, OrderStatus, DeliveryPerson, Product } from '../types/index.ts';
import { Package } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { orderService } from '../services/orderService.ts';
import { productService } from '../services/productService.ts';

// Componentes modulares de operaciones de personal (Staff/Pickers)
import { StaffHeader } from '../components/staff/StaffHeader.tsx';
import { OrderCard } from '../components/staff/OrderCard.tsx';
import { SubstitutionModal } from '../components/staff/SubstitutionModal.tsx';
import { CancelOrderModal } from '../components/staff/CancelOrderModal.tsx';
import { PaginationBar } from '../components/catalog/PaginationBar.tsx';

export const StaffDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableMotorizados, setAvailableMotorizados] = useState<DeliveryPerson[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Estados para paginación de pedidos
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // Estados para preparación interactiva, errores y productos sustitutos
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [substitutingItem, setSubstitutingItem] = useState<{ orderId: string, productId: string, name: string } | null>(null);
  const [cancelingOrder, setCancelingOrder] = useState<{ id: string; customerName: string; isLastItem?: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modifyingOrderId, setModifyingOrderId] = useState<string | null>(null);
  const [dirtyOrders, setDirtyOrders] = useState<Record<string, boolean>>({});

  const dirtyOrdersRef = React.useRef(dirtyOrders);
  useEffect(() => {
    dirtyOrdersRef.current = dirtyOrders;
  }, [dirtyOrders]);

  const fetchOrders = () => {
    orderService.getOrders({ todayOnly: true })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  };

  const fetchMotorizados = () => {
    orderService.getAvailableDeliveryPersons()
      .then(data => setAvailableMotorizados(data))
      .catch(err => console.error("Error fetching motorizados:", err));
  };

  const fetchProducts = () => {
    productService.getProducts({ all: true })
      .then(data => setCatalogProducts(data.items || []))
      .catch(err => console.error("Error fetching products:", err));
  };

  useEffect(() => {
    fetchOrders();
    fetchMotorizados();
    fetchProducts();

    // Polling cada 10 segundos para emular actualizaciones en ruta
    const interval = setInterval(() => {
      orderService.getOrders({ todayOnly: true })
        .then(data => {
          setOrders(prevOrders => {
            return data.map(serverOrder => {
              if (dirtyOrdersRef.current[serverOrder.id]) {
                const localDraft = prevOrders.find(o => o.id === serverOrder.id);
                return localDraft || serverOrder;
              }
              return serverOrder;
            });
          });
        })
        .catch(err => console.error("Error polling orders:", err));

      fetchMotorizados();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Resetear a página 1 al cambiar el filtro
  useEffect(() => {
    setPage(1);
  }, [filter]);


  const handleUpdateItemQuantity = (orderId: string, productId: string, delta: number) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== orderId) return order;

      const updatedItems = order.items.map(item => {
        const currentQty = Number(item.requestedQuantity ?? (item as any).quantity ?? 1);
        if (item.productId === productId) {
          const newQty = Math.max(1, currentQty + delta);
          return { ...item, requestedQuantity: newQty };
        }
        return { ...item, requestedQuantity: currentQty };
      });

      const newTotal = updatedItems.reduce((acc, item) => {
        const qty = Number(item.requestedQuantity ?? (item as any).quantity ?? 1);
        const price = Number(item.price || 0);
        return acc + (price * qty);
      }, 0);

      return { ...order, items: updatedItems, total: newTotal };
    }));

    setDirtyOrders(prev => ({ ...prev, [orderId]: true }));
  };

  const handleRemoveItem = (orderId: string, productId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.items.length <= 1) {
      setCancelingOrder({ id: order.id, customerName: order.customerName, isLastItem: true });
      return;
    }

    if (!window.confirm("¿Está seguro de eliminar este producto de la orden?")) return;
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id !== orderId) return o;

      const updatedItems = o.items.filter(item => item.productId !== productId);
      const newTotal = updatedItems.reduce((acc, item) => {
        const qty = Number(item.requestedQuantity ?? (item as any).quantity ?? 1);
        const price = Number(item.price || 0);
        return acc + (price * qty);
      }, 0);

      return { ...o, items: updatedItems, total: newTotal };
    }));

    setDirtyOrders(prev => ({ ...prev, [orderId]: true }));
  };

  const handleConfirmCancelOrder = async (orderId: string, reason: string) => {
    setModifyingOrderId(orderId);
    setErrorMessage(null);
    try {
      await orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED, reason as any);
      setCancelingOrder(null);
      setDirtyOrders(prev => ({ ...prev, [orderId]: false }));
      fetchOrders();
    } catch (err: any) {
      console.error("Error canceling order:", err);
      setErrorMessage(err.message || "No se pudo cancelar la orden.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setModifyingOrderId(null);
    }
  };

  const handlePerformSubstitution = async (replacementProduct: Product) => {
    if (!substitutingItem) return;
    const { orderId, productId: oldProductId } = substitutingItem;

    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== orderId) return order;

      const oldItem = order.items.find(i => i.productId === oldProductId);
      const qty = oldItem ? Number(oldItem.requestedQuantity ?? (oldItem as any).quantity ?? 1) : 1;

      const remainingItems = order.items.filter(item => item.productId !== oldProductId);
      const existingInOrder = remainingItems.find(item => item.productId === replacementProduct.id);
      let updatedItems: typeof order.items;

      if (existingInOrder) {
        updatedItems = remainingItems.map(item => {
          if (item.productId === replacementProduct.id) {
            const currentQty = Number(item.requestedQuantity ?? (item as any).quantity ?? 1);
            return { ...item, requestedQuantity: currentQty + qty };
          }
          return item;
        });
      } else {
        const newItem = {
          productId: replacementProduct.id,
          name: replacementProduct.name,
          price: replacementProduct.discountPrice || replacementProduct.price,
          requestedQuantity: qty,
        };
        updatedItems = [...remainingItems, newItem as any];
      }

      const newTotal = updatedItems.reduce((acc, item) => {
        const itemQty = Number(item.requestedQuantity ?? (item as any).quantity ?? 1);
        const itemPrice = Number(item.price || 0);
        return acc + (itemPrice * itemQty);
      }, 0);

      return { ...order, items: updatedItems, total: newTotal };
    }));

    setDirtyOrders(prev => ({ ...prev, [orderId]: true }));
    setSubstitutingItem(null);
  };

  const handleSaveOrderItems = async (orderId: string) => {
    setModifyingOrderId(orderId);
    setErrorMessage(null);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const payload = order.items.map(item => ({
        productId: item.productId,
        requestedQuantity: Number(item.requestedQuantity ?? (item as any).quantity ?? 1)
      }));

      const updatedOrder = await orderService.updateOrderItems(orderId, payload);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      setDirtyOrders(prev => ({ ...prev, [orderId]: false }));
    } catch (err: any) {
      console.error("Error saving order items:", err);
      setErrorMessage(err.message || "No se pudieron guardar los cambios. Verifique el stock.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setModifyingOrderId(null);
    }
  };

  const handleDiscardOrderChanges = (orderId: string) => {
    fetchOrders();
    setDirtyOrders(prev => ({ ...prev, [orderId]: false }));
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    if (dirtyOrders[orderId]) {
      await handleSaveOrderItems(orderId);
    }

    if (status === OrderStatus.READY_TO_PAY) {
      setAssigningId(orderId);
      return;
    }
    try {
      await orderService.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const handleAssignDelivery = async (orderId: string, motorizadoId: string) => {
    try {
      if (dirtyOrders[orderId]) {
        await handleSaveOrderItems(orderId);
      }
      await orderService.assignDeliveryPerson(orderId, motorizadoId);
      setAssigningId(null);
      fetchOrders();
      fetchMotorizados();
    } catch (err) {
      console.error("Error assigning delivery:", err);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : filter === OrderStatus.READY_TO_PAY
    ? orders.filter(o => (o.status === OrderStatus.READY_TO_PAY || o.status === OrderStatus.PAID) && !!o.deliveryPersonId)
    : orders.filter(o => o.status === filter);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / limit));

  // Validar límites de página al cambiar cantidad de pedidos o límite
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedOrders = filteredOrders.slice((page - 1) * limit, page * limit);

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-brand animate-pulse">
        Iniciando terminal de personal operativo...
      </div>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-12">

        {/* Modular Header */}
        <StaffHeader filter={filter} setFilter={setFilter} />

        {/* Orders Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {paginatedOrders.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-inner">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 font-medium tracking-tight text-lg">
                  Cola vacía • Esperando nuevos pedidos
                </p>
              </div>
            ) : (
              paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  availableMotorizados={availableMotorizados}
                  modifyingOrderId={modifyingOrderId}
                  errorMessage={errorMessage}
                  assigningId={assigningId}
                  isDirty={!!dirtyOrders[order.id]}
                  setAssigningId={setAssigningId}
                  onUpdateStatus={handleUpdateStatus}
                  onAssignDelivery={handleAssignDelivery}
                  onUpdateItemQuantity={handleUpdateItemQuantity}
                  onRemoveItem={handleRemoveItem}
                  onSaveOrderItems={handleSaveOrderItems}
                  onDiscardOrderChanges={handleDiscardOrderChanges}
                  onSetSubstitutingItem={setSubstitutingItem}
                  onOpenCancelModal={(id, customerName) => setCancelingOrder({ id, customerName })}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Barra de Paginación Inferior */}
        {filteredOrders.length > 0 && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalProducts={filteredOrders.length}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            entityName="pedidos"
            limitOptions={[6, 12, 24, 48]}
          />
        )}
      </div>

      {/* Modular Substitution Popup Overlay */}
      <SubstitutionModal
        substitutingItem={substitutingItem}
        onClose={() => { setSubstitutingItem(null); setErrorMessage(null); }}
        catalogProducts={catalogProducts}
        onPerformSubstitution={handlePerformSubstitution}
        errorMessage={errorMessage}
      />

      {/* Modular Cancel Order Popup Overlay */}
      <CancelOrderModal
        cancelingOrder={cancelingOrder}
        onClose={() => { setCancelingOrder(null); setErrorMessage(null); }}
        onConfirmCancel={handleConfirmCancelOrder}
        errorMessage={errorMessage}
      />
    </main>
  );
};
