/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './apiClient.ts';
import { Order, OrderStatus, DeliveryPerson, CartItem } from '../types/index.ts';

export interface CreateOrderPayload {
  deliveryAddress?: string;
  fulfillmentMethod?: 'DELIVERY' | 'PICK_UP';
  items: Array<{
    productId: string;
    requestedQuantity: number;
  }>;
}

export const orderService = {
  /**
   * Obtiene la lista de todos los pedidos activos (Para Administradores, Staff y Delivery).
   */
  getOrders: async (): Promise<Order[]> => {
    return apiClient.get<Order[]>('/api/orders');
  },

  /**
   * Obtiene únicamente los pedidos pertenecientes al cliente en sesión.
   */
  getMyOrders: async (): Promise<Order[]> => {
    return apiClient.get<Order[]>('/api/orders/my-orders');
  },

  /**
   * Registra un nuevo pedido en el sistema.
   * @param payload - Dirección opcional, método de entrega e ítems solicitados.
   */
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    return apiClient.post<Order>('/api/orders', payload);
  },

  /**
   * Actualiza el estado de un pedido (por ejemplo, de PENDING a PICKING).
   * @param orderId - El ID del pedido a actualizar.
   * @param status - El nuevo estado del pedido.
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    return apiClient.patch<void>(`/api/orders/${orderId}/status`, { status });
  },

  /**
   * Actualiza los productos (ítems) e importes totales de un pedido activo.
   * @param orderId - El ID del pedido.
   * @param items - La nueva lista de artículos modificados.
   */
  updateOrderItems: async (orderId: string, items: Array<{ productId: string; requestedQuantity: number }>): Promise<Order> => {
    return apiClient.patch<Order>(`/api/orders/${orderId}/items`, { items });
  },

  /**
   * Registra el proceso de recolección física (picking) realizado por el personal.
   */
  processPicking: async (
    orderId: string, 
    items: Array<{ productId: string; pickedQuantity: number; status: string; substitutedWithId?: string }>
  ): Promise<Order> => {
    return apiClient.patch<Order>(`/api/orders/${orderId}/picking`, { items });
  },

  /**
   * Obtiene la lista de repartidores motorizados disponibles en el sistema.
   */
  getAvailableDeliveryPersons: async (): Promise<DeliveryPerson[]> => {
    return apiClient.get<DeliveryPerson[]>('/api/delivery/available');
  },

  /**
   * Asigna un repartidor motorizado a un pedido que está listo para entrega.
   * @param orderId - El ID del pedido.
   * @param deliveryPersonId - El ID del repartidor asignado.
   */
  assignDeliveryPerson: async (orderId: string, deliveryPersonId: string): Promise<void> => {
    return apiClient.patch<void>(`/api/orders/${orderId}/assign-delivery`, { deliveryPersonId });
  }
};
