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

export const StaffDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableMotorizados, setAvailableMotorizados] = useState<DeliveryPerson[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Estados para preparación interactiva, errores y productos sustitutos
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [substitutingItem, setSubstitutingItem] = useState<{ orderId: string, productId: string, name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modifyingOrderId, setModifyingOrderId] = useState<string | null>(null);

  const fetchOrders = () => {
    orderService.getOrders()
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
      fetchOrders();
      fetchMotorizados();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateItemQuantity = async (orderId: string, productId: string, delta: number) => {
    setModifyingOrderId(orderId);
    setErrorMessage(null);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedItems = order.items.map(item => {
        const currentQty = Number(item.requestedQuantity ?? (item as any).quantity ?? 1);
        if (item.productId === productId) {
          const newQty = currentQty + delta;
          return { ...item, requestedQuantity: newQty < 1 ? 1 : newQty };
        }
        return { ...item, requestedQuantity: currentQty };
      });

      const payload = updatedItems.map(item => ({
        productId: item.productId,
        requestedQuantity: item.requestedQuantity
      }));

      await orderService.updateOrderItems(orderId, payload);
      fetchOrders();
    } catch (err: any) {
      console.error("Error updating quantity:", err);
      setErrorMessage(err.message || "No se pudo actualizar la cantidad. Verifique el stock.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setModifyingOrderId(null);
    }
  };

  const handleRemoveItem = async (orderId: string, productId: string) => {
    if (!window.confirm("¿Está seguro de eliminar este producto de la orden?")) return;
    setModifyingOrderId(orderId);
    setErrorMessage(null);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedItems = order.items.filter(item => item.productId !== productId);
      await orderService.updateOrderItems(orderId, updatedItems as any);
      fetchOrders();
    } catch (err: any) {
      console.error("Error removing item:", err);
      setErrorMessage(err.message || "No se pudo eliminar el producto.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setModifyingOrderId(null);
    }
  };

  const handlePerformSubstitution = async (replacementProduct: Product) => {
    if (!substitutingItem) return;
    const { orderId, productId: oldProductId } = substitutingItem;

    setModifyingOrderId(orderId);
    setErrorMessage(null);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const oldItem = order.items.find(i => i.productId === oldProductId);
      const qty = oldItem ? Number(oldItem.requestedQuantity ?? (oldItem as any).quantity ?? 1) : 1;

      // 1. Filtrar el producto anterior y transformar los items al formato del payload del backend { productId, requestedQuantity }
      const payload = order.items
        .filter(item => item.productId !== oldProductId)
        .map(item => ({
          productId: item.productId,
          requestedQuantity: Number(item.requestedQuantity ?? (item as any).quantity ?? 1),
        }));

      // 2. Si el producto sustituto ya existe en la orden, incrementar la cantidad
      const existingInOrder = payload.find(item => item.productId === replacementProduct.id);
      if (existingInOrder) {
        existingInOrder.requestedQuantity += qty;
      } else {
        // 3. Si no existe, agregar el nuevo producto sustituto
        payload.push({
          productId: replacementProduct.id,
          requestedQuantity: qty
        });
      }

      await orderService.updateOrderItems(orderId, payload);
      setSubstitutingItem(null);
      fetchOrders();
    } catch (err: any) {
      console.error("Error performing substitution:", err);
      setErrorMessage(err.message || "No se pudo realizar la sustitución. Verifique stock del sustituto.");
    } finally {
      setModifyingOrderId(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
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
    ? orders.filter(o => o.status === OrderStatus.READY_TO_PAY || o.status === OrderStatus.PAID)
    : orders.filter(o => o.status === filter);

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
            {filteredOrders.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-inner">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 font-medium tracking-tight text-lg">
                  Cola vacía • Esperando nuevos pedidos
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  availableMotorizados={availableMotorizados}
                  modifyingOrderId={modifyingOrderId}
                  errorMessage={errorMessage}
                  assigningId={assigningId}
                  setAssigningId={setAssigningId}
                  onUpdateStatus={handleUpdateStatus}
                  onAssignDelivery={handleAssignDelivery}
                  onUpdateItemQuantity={handleUpdateItemQuantity}
                  onRemoveItem={handleRemoveItem}
                  onSetSubstitutingItem={setSubstitutingItem}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modular Substitution Popup Overlay */}
      <SubstitutionModal
        substitutingItem={substitutingItem}
        onClose={() => { setSubstitutingItem(null); setErrorMessage(null); }}
        catalogProducts={catalogProducts}
        onPerformSubstitution={handlePerformSubstitution}
        errorMessage={errorMessage}
      />
    </main>
  );
};
