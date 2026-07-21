import { getPrisma } from "../db.ts";
import { OrderStatus, ItemStatus } from "../../../generated/prisma/enums.ts"; //

export interface CreateOrderPayload {
  customerId: string;
  customerName: string;
  cedula: string;
  customerPhone: string;
  deliveryAddress?: string | null;
  fulfillmentMethod?: "DELIVERY" | "PICK_UP";
  subtotal: number;
  shippingCost?: number;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    requestedQuantity: number;
  }>;
}

export class OrderRepository {
  /**
   * 1. Obtiene todas las órdenes de la base de datos con sus items asociados.
   */
  private prisma = getPrisma();

  async getAll() {
    return await this.prisma.order.findMany({
      include: {
        items: true, // Incluye la relación OrderItem[] mapeada en tu schema
      },
      orderBy: {
        createdAt: "desc", // Ordena las órdenes de la más nueva a la más antigua
      },
    });
  }

  /**
   * Obtiene las órdenes pertenecientes a un cliente específico.
   */
  async getByCustomerId(customerId: string) {
    return await this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * 2. Obtiene una orden específica por su ID junto a sus productos.
   */
  async getById(id: string) {
    return await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true, // Incluye los OrderItem de la orden
      },
    });
  }

  /**
   * 3. Crea una orden y sus items de forma atómica en una sola transacción.
   */
  async create(data: CreateOrderPayload) {
    return await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: data.customerId,
          customerName: data.customerName,
          cedula: data.cedula,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost ?? 0.0,
          total: data.total,
          status: OrderStatus.PENDING, // Tu valor inicial por defecto

          ...(data.fulfillmentMethod && {
            fulfillmentMethod: data.fulfillmentMethod,
          }),

          // Inserción anidada de los productos solicitados
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              requestedQuantity: item.requestedQuantity,
              pickedQuantity: 0.0, // Inicializado para el picker
              status: ItemStatus.COMPLETED, // Estado inicial por defecto
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });
  }

  /**
   * 4. Actualiza el estado de la orden y registra opcionalmente al picker que la tomó.
   */
  async updateStatus(id: string, status: OrderStatus, pickerId?: string) {
    return await this.prisma.order.update({
      where: { id },
      data: {
        status,
        ...(pickerId && { pickerId }),
        // 'updatedAt' se actualizará automáticamente gracias a tu directiva @updatedAt
      },
      include: {
        items: true,
      },
    });
  }

  /**
   * 5. Actualiza los productos y montos de una orden de forma atómica (Reemplazo total de items).
   */
  async updateItems(
    id: string,
    items: Array<{
      productId: string;
      name: string;
      price: number;
      requestedQuantity: number;
      pickedQuantity: number;
      status?: ItemStatus;
    }>,
    subtotal: number,
    total: number,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // Paso A: Eliminamos todos los items anteriores asociados a esta orden[cite: 1]
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Paso B: Insertamos los nuevos items y actualizamos los totales de la cabecera
      return await tx.order.update({
        where: { id },
        data: {
          subtotal,
          total,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              requestedQuantity: item.requestedQuantity,
              pickedQuantity: item.pickedQuantity,
              status: item.status ?? ItemStatus.COMPLETED, //
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });
  }

  async updatePickingResults(
    orderId: string,
    pickerId: string,
    items: Array<{
      productId: string;
      pickedQuantity: number;
      status: ItemStatus;
      substitutedWithId?: string | null;
    }>,
    subtotal: number,
    total: number,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Modificar cada ítem en su sitio usando updateMany
      for (const item of items) {
        await tx.orderItem.updateMany({
          where: {
            orderId: orderId,
            productId: item.productId,
          },
          data: {
            pickedQuantity: item.pickedQuantity,
            status: item.status,
            ...(item.substitutedWithId !== undefined && {
              substitutedWithId: item.substitutedWithId,
            }),
          },
        });
      }
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          subtotal,
          total,
          status: OrderStatus.READY_TO_PAY,
          pickerId,
        },
        include: {
          items: true, // Incluimos los items actualizados para retornarlos al servicio
        },
      });
      return updatedOrder;
    });
  }

  /**
   * 6. Asigna el repartidor a la orden y cambia su estado a entregado.
   */
  async assignDelivery(id: string, deliveryPersonId: string) {
    return await this.prisma.order.update({
      where: { id },
      data: {
        deliveryPersonId,
        status: OrderStatus.DELIVERED, // Transición automática según tu flujo original
      },
      include: {
        items: true,
      },
    });
  }
}

export const orderRepository = new OrderRepository();
