import { orderRepository } from "../repositories/orderRepository.ts";
import { productService } from "./productService.ts";
import { Order, OrderStatus, CartItem } from "../../../src/types/index.ts";
import { v4 as uuidv4 } from "uuid";

export class OrderService {
  async getAllOrders(): Promise<Order[]> {
    return await orderRepository.getAll();
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return await orderRepository.getById(id);
  }

  async createOrder(customerName: string, customerID: string, customerPhone: string, paymentMethod: string, items: CartItem[]): Promise<Order> {
    // 1. Validate stock for all items
    for (const item of items) {
      const hasStock = await productService.validateAndReserveStock(item.productId, item.quantity);
      if (!hasStock) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // 2. Calculate total
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 3. Create order
    const newOrder: Order = {
      id: uuidv4(),
      customerName,
      customerID,
      customerPhone,
      paymentMethod,
      items,
      total,
      status: OrderStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return await orderRepository.create(newOrder);
  }

  async updateStatus(id: string, status: OrderStatus, pickerId?: string): Promise<Order | undefined> {
    // If order is cancelled, restore stock
    if (status === OrderStatus.CANCELLED) {
      const order = await orderRepository.getById(id);
      if (order) {
        for (const item of order.items) {
          await productService.restoreStock(item.productId, item.quantity);
        }
      }
    }
    
    return await orderRepository.updateStatus(id, status, pickerId);
  }

  async updateItems(id: string, items: CartItem[]): Promise<Order | undefined> {
    const order = await orderRepository.getById(id);
    if (!order) return undefined;

    // Obtener cantidades previas
    const oldItemsMap = new Map<string, number>();
    for (const item of order.items) {
      oldItemsMap.set(item.productId, (oldItemsMap.get(item.productId) || 0) + item.quantity);
    }

    // Obtener nuevas cantidades
    const newItemsMap = new Map<string, number>();
    for (const item of items) {
      newItemsMap.set(item.productId, (newItemsMap.get(item.productId) || 0) + item.quantity);
    }

    // Unir todos los IDs de producto involucrados
    const allProductIds = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);

    // Validar y ajustar stock
    for (const productId of allProductIds) {
      const oldQty = oldItemsMap.get(productId) || 0;
      const newQty = newItemsMap.get(productId) || 0;
      const diff = newQty - oldQty;

      if (diff > 0) {
        // Necesitamos más stock (por aumento o sustitución)
        const hasStock = await productService.validateAndReserveStock(productId, diff);
        if (!hasStock) {
          const prod = await productService.getProductById(productId);
          throw new Error(`Stock insuficiente para sustituir/agregar a ${prod?.name || 'producto'}`);
        }
      } else if (diff < 0) {
        // Devolvemos stock liberado
        await productService.restoreStock(productId, Math.abs(diff));
      }
    }

    // Calcular el nuevo total de la orden
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return await orderRepository.updateItems(id, items, total);
  }

  async assignDelivery(id: string, deliveryPersonId: string): Promise<Order | undefined> {
    return await orderRepository.assignDelivery(id, deliveryPersonId);
  }
}

export const orderService = new OrderService();
