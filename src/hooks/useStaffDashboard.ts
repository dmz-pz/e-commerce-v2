import { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, DeliveryPerson, Product, OrderItem } from '../types/index.ts';
import { orderService } from '../services/orderService.ts';
import { productService } from '../services/productService.ts';

export const useStaffDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableMotorizados, setAvailableMotorizados] = useState<DeliveryPerson[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [substitutingItem, setSubstitutingItem] = useState<{ orderId: string, productId: string, name: string } | null>(null);
  const [addingToOrderId, setAddingToOrderId] = useState<string | null>(null);
  const [validatingPaymentOrderId, setValidatingPaymentOrderId] = useState<string | null>(null);
  const [cancelingOrder, setCancelingOrder] = useState<{ id: string; customerName: string; isLastItem?: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modifyingOrderId, setModifyingOrderId] = useState<string | null>(null);
  const [dirtyOrders, setDirtyOrders] = useState<Record<string, boolean>>({});

  const dirtyOrdersRef = useRef(dirtyOrders);
  useEffect(() => {
    dirtyOrdersRef.current = dirtyOrders;
  }, [dirtyOrders]);

  const fetchOrders = () => {
    orderService.getOrders({ todayOnly: true, limit: 1000 }) // limit 1000 for dashboard processing
      .then(data => {
        setOrders(data.items || []);
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

    const interval = setInterval(() => {
      orderService.getOrders({ todayOnly: true, limit: 1000 })
        .then(data => {
          setOrders(prevOrders => {
            return (data.items || []).map((serverOrder: Order) => {
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

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleUpdateItemQuantity = (orderId: string, productId: string, delta: number) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== orderId) return order;

      const updatedItems = order.items.map(item => {
        const currentQty = Number(item.requestedQuantity ?? item.quantity ?? 1);
        if (item.productId === productId) {
          const newQty = Math.max(1, currentQty + delta);
          return { ...item, requestedQuantity: newQty };
        }
        return { ...item, requestedQuantity: currentQty };
      });

      const newTotal = updatedItems.reduce((acc, item) => {
        const qty = Number(item.requestedQuantity ?? item.quantity ?? 1);
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
        const qty = Number(item.requestedQuantity ?? item.quantity ?? 1);
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
      await orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED, reason);
      setCancelingOrder(null);
      setDirtyOrders(prev => ({ ...prev, [orderId]: false }));
      fetchOrders();
    } catch (error) {
      const err = error as Error;
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
      const qty = oldItem ? Number(oldItem.requestedQuantity ?? oldItem.quantity ?? 1) : 1;

      const remainingItems = order.items.filter(item => item.productId !== oldProductId);
      const existingInOrder = remainingItems.find(item => item.productId === replacementProduct.id);
      let updatedItems: typeof order.items;

      if (existingInOrder) {
        updatedItems = remainingItems.map(item => {
          if (item.productId === replacementProduct.id) {
            const currentQty = Number(item.requestedQuantity ?? item.quantity ?? 1);
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
        updatedItems = [...remainingItems, newItem as unknown as OrderItem];
      }

      const newTotal = updatedItems.reduce((acc, item) => {
        const itemQty = Number(item.requestedQuantity ?? item.quantity ?? 1);
        const itemPrice = Number(item.price || 0);
        return acc + (itemPrice * itemQty);
      }, 0);

      return { ...order, items: updatedItems, total: newTotal };
    }));

    setDirtyOrders(prev => ({ ...prev, [orderId]: true }));
    setSubstitutingItem(null);
  };

  const handleAddProduct = async (product: Product) => {
    if (!addingToOrderId) return;
    const orderId = addingToOrderId;

    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== orderId) return order;

      const existingInOrder = order.items.find(item => item.productId === product.id);
      let updatedItems: typeof order.items;

      if (existingInOrder) {
        updatedItems = order.items.map(item => {
          if (item.productId === product.id) {
            const currentQty = Number(item.requestedQuantity ?? item.quantity ?? 1);
            return { ...item, requestedQuantity: currentQty + 1 };
          }
          return item;
        });
      } else {
        const newItem = {
          productId: product.id,
          name: product.name,
          price: product.discountPrice || product.price,
          requestedQuantity: 1,
        };
        updatedItems = [...order.items, newItem as unknown as OrderItem];
      }

      const newTotal = updatedItems.reduce((acc, item) => {
        const itemQty = Number(item.requestedQuantity ?? item.quantity ?? 1);
        const itemPrice = Number(item.price || 0);
        return acc + (itemPrice * itemQty);
      }, 0);

      return { ...order, items: updatedItems, total: newTotal };
    }));

    setDirtyOrders(prev => ({ ...prev, [orderId]: true }));
    setAddingToOrderId(null);
  };

  const handleSaveOrderItems = async (orderId: string) => {
    setModifyingOrderId(orderId);
    setErrorMessage(null);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const payload = order.items.map(item => ({
        productId: item.productId,
        requestedQuantity: Number(item.requestedQuantity ?? item.quantity ?? 1)
      }));

      const updatedOrder = await orderService.updateOrderItems(orderId, payload);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      setDirtyOrders(prev => ({ ...prev, [orderId]: false }));
    } catch (error) {
      const err = error as Error;
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

  const handleConfirmPaymentAndFinish = async (orderId: string, reference: string, receiptFile?: File) => {
    setModifyingOrderId(orderId);
    setErrorMessage(null);
    try {
      // 1. Guardar cambios si hay items sucios
      if (dirtyOrders[orderId]) {
        await handleSaveOrderItems(orderId);
      }

      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // 3. Confirmar la referencia de pago y avanzar estado
      const formData = new FormData();
      formData.append('status', OrderStatus.READY_TO_PAY);
      formData.append('paymentReference', reference);
      if (receiptFile) {
        formData.append('receiptImage', receiptFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Error al validar el pago.');
      }

      setValidatingPaymentOrderId(null);
      fetchOrders();
    } catch (error) {
      const err = error as Error;
      console.error("Error confirming payment:", err);
      setErrorMessage(err.message || 'Ocurrió un error al procesar el pago.');
    } finally {
      setModifyingOrderId(null);
    }
  };

  const handleAssignDelivery = async (orderId: string, motorizadoId: string) => {
    try {
      if (dirtyOrders[orderId]) {
        await handleSaveOrderItems(orderId);
      }
      const order = orders.find(o => o.id === orderId);
      if (order && order.status === OrderStatus.PICKING) {
        await orderService.updateOrderStatus(orderId, OrderStatus.READY_TO_PAY);
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
    ? orders.filter(o => o.status === OrderStatus.READY_TO_PAY || o.status === OrderStatus.PAID)
    : orders.filter(o => o.status === filter);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / limit));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedOrders = filteredOrders.slice((page - 1) * limit, page * limit);

  return {
    loading,
    filter,
    setFilter,
    page,
    setPage,
    limit,
    setLimit,
    assigningId,
    setAssigningId,
    catalogProducts,
    substitutingItem,
    setSubstitutingItem,
    addingToOrderId,
    setAddingToOrderId,
    validatingPaymentOrderId,
    setValidatingPaymentOrderId,
    cancelingOrder,
    setCancelingOrder,
    errorMessage,
    setErrorMessage,
    modifyingOrderId,
    availableMotorizados,
    dirtyOrders,
    paginatedOrders,
    filteredOrders,
    totalPages,
    handleUpdateItemQuantity,
    handleRemoveItem,
    handleConfirmCancelOrder,
    handlePerformSubstitution,
    handleAddProduct,
    handleSaveOrderItems,
    handleDiscardOrderChanges,
    handleUpdateStatus,
    handleConfirmPaymentAndFinish,
    handleAssignDelivery,
  };
};
