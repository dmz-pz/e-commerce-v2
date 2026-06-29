import { Order, OrderStatus } from "../../../src/types/index.ts";
import { orders } from "../mocks/orders.ts";

export class OrderRepository {
  async getAll(): Promise<Order[]> {
    return orders;
  }

  async getById(id: string): Promise<Order | undefined> {
    return orders.find(o => o.id === id);
  }

  async create(order: Order): Promise<Order> {
    orders.push(order);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, pickerId?: string): Promise<Order | undefined> {
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = Date.now();
      if (pickerId) orders[index].pickerId = pickerId;
      return orders[index];
    }
    return undefined;
  }

  async updateItems(id: string, items: any[], total: number): Promise<Order | undefined> {
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].items = items;
      orders[index].total = total;
      orders[index].updatedAt = Date.now();
      return orders[index];
    }
    return undefined;
  }

  async assignDelivery(id: string, deliveryPersonId: string): Promise<Order | undefined> {
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].deliveryPersonId = deliveryPersonId;
      orders[index].status = OrderStatus.DELIVERED; // Assuming assignment triggers delivery start
      orders[index].updatedAt = Date.now();
      return orders[index];
    }
    return undefined;
  }
}

export const orderRepository = new OrderRepository();
