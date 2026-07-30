import { prisma } from "../db.ts";
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

  async getAll(options?: { todayOnly?: boolean }) {
    const where: Record<string, unknown> = {};
    if (options?.todayOnly) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      where.createdAt = {
        gte: startOfToday,
      };
    }

    return await prisma.order.findMany({
      where,
      include: {
        items: true,
        payment: true,
        deliveryJobs: { 
          orderBy: { assignedAt: "desc" }, 
          take: 1,
          include: { deliveryPerson: true }
        },
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
    return await prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        payment: true,
        deliveryJobs: { 
          orderBy: { assignedAt: "desc" }, 
          take: 1,
          include: { deliveryPerson: true }
        },
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
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: true, // Incluye los OrderItem de la orden
        payment: true,
        deliveryJobs: { 
          orderBy: { assignedAt: "desc" }, 
          take: 1,
          include: { deliveryPerson: true }
        },
      },
    });
  }

  /**
   * 3. Crea una orden y sus items de forma atómica en una sola transacción.
   */
  async create(data: CreateOrderPayload) {
    return await prisma.$transaction(async (tx) => {
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

  async updateStatus(id: string, status: OrderStatus, pickerId?: string, _actionUserId?: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Update the order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status,
          ...(pickerId && { pickerId }),
        },
        include: {
          items: true,
          payment: true,
          deliveryJobs: { 
            orderBy: { assignedAt: "desc" }, 
            take: 1,
            include: { deliveryPerson: true }
          },
        },
      });

      // 2. If it's a delivery action (DELIVERED or RETURNED), handle the active DeliveryJob and cash
      if (status === "DELIVERED" || status === "RETURNED") {
        const activeJob = updatedOrder.deliveryJobs[0];

        if (activeJob && activeJob.status !== "COMPLETED" && activeJob.status !== "FAILED") {
          // A. Mark job as COMPLETED or FAILED
          const jobStatus = status === "DELIVERED" ? "COMPLETED" : "FAILED";
          await tx.deliveryJob.update({
            where: { id: activeJob.id },
            data: {
              status: jobStatus,
              completedAt: new Date()
            }
          });

          // B. Cash in hand reconciliation for EFECTIVO_DELIVERY
          if (status === "DELIVERED" && updatedOrder.payment?.method === "EFECTIVO_DELIVERY") {
            const driverId = activeJob.deliveryPersonId;
            // Mark payment as APPROVED
            await tx.payment.update({
              where: { id: updatedOrder.payment.id },
              data: { status: "APPROVED" }
            });

            // Upsert the delivery profile and add cash
            await tx.deliveryProfile.upsert({
              where: { userId: driverId },
              create: {
                userId: driverId,
                status: "AVAILABLE",
                cashInHand: updatedOrder.total
              },
              update: {
                cashInHand: { increment: updatedOrder.total }
              }
            });
          }
        }
      }

      return updatedOrder;
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
    return await prisma.$transaction(async (tx) => {
      // Paso A: Eliminamos todos los items anteriores asociados a esta orden[cite: 1]
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Paso B: Insertamos los nuevos items y actualizamos los totales de la cabecera
      const updatedOrder = await tx.order.update({
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
          payment: true,
        },
      });

      // Asegurar la actualización del pago usando orderId directo (ignora si falla por no existir)
      await tx.payment.updateMany({
        where: { orderId: id },
        data: { amount: total }
      });

      return updatedOrder;
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
    return await prisma.$transaction(async (tx) => {
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
          items: true,
          payment: true,
        },
      });

      // Si la orden tiene un registro de pago, actualizamos su monto
      if (updatedOrder.payment) {
        await tx.payment.update({
          where: { id: updatedOrder.payment.id },
          data: { amount: total }
        });
      }

      return updatedOrder;
    });
  }

  /**
   * 6. Asigna el repartidor creando un DeliveryJob
   */
  async assignDelivery(id: string, deliveryPersonId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.deliveryJob.create({
        data: {
          orderId: id,
          deliveryPersonId,
        }
      });
      return await tx.order.findUnique({
        where: { id },
        include: {
          items: true,
          payment: true,
          deliveryJobs: { 
            orderBy: { assignedAt: "desc" }, 
            take: 1,
            include: { deliveryPerson: true }
          },
        },
      });
    });
  }
}

export const orderRepository = new OrderRepository();
