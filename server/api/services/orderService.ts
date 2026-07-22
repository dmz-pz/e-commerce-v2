import { orderRepository } from "../repositories/orderRepository.ts";
import { userRepository } from "../repositories/userRepository.ts";
import { productRepository } from "../repositories/productRepository.ts";
import { productService } from "./productService.ts"; //
import { OrderStatus, ItemStatus, PaymentStatus } from "../../../generated/prisma/enums.ts"; //
import { paymentRepository } from "../repositories/paymentRepository.ts";
import { CreateOrderInput } from "../schemas/orderSchema.ts";
import { AppError } from "../utils/appErrors.ts";
import { auditLogRepository } from "../repositories/auditLogRepository.ts";

export class OrderService {
  /**
   * 1. Obtiene todas las órdenes del repositorio real de la base de datos.
   */
  async getAllOrders(options?: { todayOnly?: boolean }) {
    return await orderRepository.getAll(options);
  }

  /**
   * Obtiene únicamente las órdenes pertenecientes a un usuario en particular.
   */
  async getUserOrders(userId: string) {
    return await orderRepository.getByCustomerId(userId);
  }

  /**
   * 2. Obtiene una orden por su ID real.
   */
  async getOrderById(id: string) {
    return await orderRepository.getById(id);
  }

  /**
   * 3. Crea una orden garantizando datos del usuario seguros, precios reales y reserva de stock
   */
  async createOrder(userId: string, orderData: CreateOrderInput["body"]) {
    const customer = await userRepository.getById(userId);

    if (!customer) {
      throw new AppError(
        "El usuario especificado no existe en el sistema.",
        404,
      );
    }

    // B. Obtener los IDs de los productos solicitados
    const productIds = orderData.items.map((item) => item.productId);

    // C. Consultar los productos reales en el catálogo (Fuente de la verdad financiera)
    const dbProducts = await productRepository.getByIds(productIds, false);

    if (dbProducts.length !== productIds.length) {
      throw new AppError(
        "Uno o más productos de su carrito ya no están disponibles en el catálogo.",
        409,
      );
    }

    // D. Validar y reservar stock en tiempo real utilizando tu lógica de negocio
    for (const item of orderData.items) {
      const hasStock = await productService.validateAndReserveStock(
        item.productId,
        item.requestedQuantity,
      );
      if (!hasStock) {
        const prod = dbProducts.find((p) => p.id === item.productId);
        throw new AppError(
          `Stock insuficiente para el producto: ${prod?.name || "Desconocido"}`,
          400,
        );
      }
    }

    // E. Calcular montos e inyectar historial inmutable de precios y nombres
    let calculatedSubtotal = 0;

    const enrichedItems = orderData.items.map((requestedItem) => {
      const realProduct = dbProducts.find(
        (p) => p.id === requestedItem.productId,
      );
      if (!realProduct) {
        throw new AppError(
          "Inconsistencia crítica al procesar un producto.",
          500,
        );
      }

      const priceAsNumber = Number(realProduct.price);
      calculatedSubtotal += priceAsNumber * requestedItem.requestedQuantity;

      return {
        productId: realProduct.id,
        name: realProduct.name, // Nombre congelado en el tiempo
        price: priceAsNumber, // Precio congelado en el tiempo
        requestedQuantity: requestedItem.requestedQuantity,
      };
    });

    const shippingCost = 0.0; // Se actualizará en otra etapa según tu instrucción
    const calculatedTotal = calculatedSubtotal + shippingCost;
    const fullCustomerName =
      `${customer.firstName} ${customer.lastName}`.trim(); //

    const newOrder = await orderRepository.create({
      customerId: customer.id,
      customerName: fullCustomerName,
      cedula: customer.cedula,
      customerPhone: customer.phone,
      deliveryAddress: orderData.deliveryAddress,
      fulfillmentMethod: orderData.fulfillmentMethod,
      subtotal: calculatedSubtotal,
      shippingCost: shippingCost,
      total: calculatedTotal,
      items: enrichedItems,
    });

    // F. Crear el registro de pago asociado a la orden si se seleccionó un método de pago
    if (orderData.paymentMethod) {
      await paymentRepository.create({
        orderId: newOrder.id,
        amount: calculatedTotal,
        method: orderData.paymentMethod as any, // Hacemos cast temporal por el enum
        status: PaymentStatus.PENDING as any,
        reference: orderData.paymentReference || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return newOrder;
  }

  /**
   * 4. Actualiza el estado de la orden y devuelve el stock en caso de cancelación.
   */
  async updateStatus(id: string, status: OrderStatus, pickerId?: string) {
    // Si la orden se cancela, devolvemos todo el stock reservado al inventario
    if (status === OrderStatus.CANCELLED) {
      //
      const order = await orderRepository.getById(id);
      if (order) {
        for (const item of order.items) {
          // Nota: Convertimos requestedQuantity (Decimal) a Number de JS
          await productService.restoreStock(
            item.productId,
            Number(item.requestedQuantity),
          );
        }
      }
    }

    return await orderRepository.updateStatus(id, status, pickerId);
  }

  /**
   * 5. Modifica los productos de la orden ajustando dinámicamente el inventario de la sucursal.
   */
  async updateItems(
    id: string,
    newItems: Array<{ productId: string; requestedQuantity: number }>,
  ) {
    const order = await orderRepository.getById(id);
    if (!order) {
      throw new AppError("La orden que intenta modificar no existe.", 404);
    }

    // A. Mapear las cantidades previas (Base de datos)
    const oldItemsMap = new Map<string, number>();
    for (const item of order.items) {
      // Convertimos el Decimal de Prisma a Number
      const quantity = Number(item.requestedQuantity);
      oldItemsMap.set(
        item.productId,
        (oldItemsMap.get(item.productId) || 0) + quantity,
      );
    }

    // B. Mapear las nuevas cantidades enviadas
    const newItemsMap = new Map<string, number>();
    for (const item of newItems) {
      newItemsMap.set(
        item.productId,
        (newItemsMap.get(item.productId) || 0) + item.requestedQuantity,
      );
    }

    // C. Unir todos los IDs de productos involucrados para el análisis diferencial
    const allProductIds = new Set([
      ...oldItemsMap.keys(),
      ...newItemsMap.keys(),
    ]);

    // D. Validar y ajustar dinámicamente el stock en la base de datos
    for (const productId of allProductIds) {
      const oldQty = oldItemsMap.get(productId) || 0;
      const newQty = newItemsMap.get(productId) || 0;
      const diff = newQty - oldQty;

      if (diff > 0) {
        // El cliente añadió más unidades: reservamos el stock adicional
        const hasStock = await productService.validateAndReserveStock(
          productId,
          diff,
        );
        if (!hasStock) {
          const prod = await productRepository.getByIds([productId], true);
          throw new AppError(
            `Stock insuficiente para sustituir o agregar: ${prod[0]?.name || "Producto"}`,
            400,
          );
        }
      } else if (diff < 0) {
        // Se redujo la cantidad o se eliminó: devolvemos la diferencia al stock
        await productService.restoreStock(productId, Math.abs(diff));
      }
    }

    // E. Consultar los precios reales de los productos del nuevo carrito para calcular el total seguro
    const uniqueNewProductIds = Array.from(newItemsMap.keys());
    const dbProducts = await productRepository.getByIds(
      uniqueNewProductIds,
      true,
    );

    // F. Mapear los nuevos items con precios congelados e inmutables del catálogo
    let calculatedSubtotal = 0;
    const itemsToUpdate = newItems.map((item) => {
      const realProduct = dbProducts.find((p) => p.id === item.productId);
      if (!realProduct) {
        throw new AppError(
          "Inconsistencia crítica al actualizar los precios de la orden.",
          500,
        );
      }

      const priceAsNumber = Number(realProduct.price);
      calculatedSubtotal += priceAsNumber * item.requestedQuantity;

      return {
        productId: realProduct.id,
        name: realProduct.name, // Mantenemos el nombre histórico actualizado
        price: priceAsNumber, // Mantenemos el precio histórico actualizado
        requestedQuantity: item.requestedQuantity,
        pickedQuantity: 0.0, // Reiniciamos a cero para que el picker vuelva a validar el pedido físico
        status: ItemStatus.COMPLETED, // Reestablecemos el estado de la línea
      };
    });

    const shippingCost = Number(order.shippingCost); // Mantenemos el costo de envío original
    const calculatedTotal = calculatedSubtotal + shippingCost;

    // G. Actualizar en el repositorio real
    return await orderRepository.updateItems(
      id,
      itemsToUpdate,
      calculatedSubtotal,
      calculatedTotal,
    );
  }

  /**
   * Procesa los resultados del picking físico en tienda, ajusta el stock lógico en caliente,
   * recalcula los montos financieros reales y actualiza el estado a READY_TO_PAY.
   */
  async processPicking(
    orderId: string,
    pickerId: string,
    pickingItems: Array<{
      productId: string;
      pickedQuantity: number;
      status: ItemStatus;
      substitutedWithId?: string;
    }>,
  ) {
    // 1. Obtener la orden actual y verificar su existencia en la base de datos
    const order = await orderRepository.getById(orderId);
    if (!order) {
      throw new AppError("La orden solicitada para el picking no existe.", 404);
    }

    // Mapear los ítems originales indexados por productId para un acceso rápido
    const originalItemsMap = new Map(
      order.items.map((item) => [item.productId, item]),
    );

    // 2. Iterar y comparar cada ítem para aplicar el ajuste de stock en caliente
    for (const pickingItem of pickingItems) {
      const originalItem = originalItemsMap.get(pickingItem.productId);
      if (!originalItem) {
        throw new AppError(
          `El producto ${pickingItem.productId} no pertenece a esta orden.`,
          400,
        );
      }

      // Convertimos la cantidad original solicitada (Decimal) a Number de JS
      const requestedQty = Number(originalItem.requestedQuantity);

      // CASO B: Sustitución de producto
      if (
        pickingItem.status === ItemStatus.SUBSTITUTED &&
        pickingItem.substitutedWithId
      ) {
        // Liberar la cantidad completa que se había reservado del producto original
        await productService.restoreStock(pickingItem.productId, requestedQty);

        // Validar y reservar la cantidad recolectada del producto sustituto en el inventario
        const hasStock = await productService.validateAndReserveStock(
          pickingItem.substitutedWithId,
          pickingItem.pickedQuantity,
        );

        if (!hasStock) {
          throw new AppError(
            `No hay stock suficiente para aplicar el producto sustituto de reemplazo.`,
            400,
          );
        }
      }
      // CASO A: Recolección parcial o cancelación normal (sin sustitución)
      else if (pickingItem.pickedQuantity < requestedQty) {
        const diff = requestedQty - pickingItem.pickedQuantity;
        // Devolvemos la diferencia sobrante al stock general de la plataforma web
        await productService.restoreStock(pickingItem.productId, diff);
      }
    }

    // 3. Recalcular totales financieros basándose en la verdad del catálogo real
    // Recopilar todos los IDs de productos que generarán cargos financieros
    const finalProductIds = pickingItems
      .filter((item) => item.status !== ItemStatus.CANCELLED) // Omitimos los cancelados
      .map((item) =>
        item.status === ItemStatus.SUBSTITUTED && item.substitutedWithId
          ? item.substitutedWithId
          : item.productId,
      );

    // Consultar los precios oficiales vigentes en la base de datos
    const dbProducts = await productRepository.getByIds(finalProductIds, true);
    const pricesMap = new Map(dbProducts.map((p) => [p.id, Number(p.price)]));

    let calculatedSubtotal = 0;

    for (const pickingItem of pickingItems) {
      // Si el ítem fue cancelado por el picker, su costo en esta orden pasa a ser 0
      if (pickingItem.status === ItemStatus.CANCELLED) {
        continue;
      }

      // Determinar cuál ID de producto debemos cobrar (el original o el sustituto)
      const targetProductId =
        pickingItem.status === ItemStatus.SUBSTITUTED &&
        pickingItem.substitutedWithId
          ? pickingItem.substitutedWithId
          : pickingItem.productId;

      const currentPrice = pricesMap.get(targetProductId) || 0;
      calculatedSubtotal += currentPrice * pickingItem.pickedQuantity;
    }

    const originalShippingCost = Number(order.shippingCost);
    const calculatedTotal = calculatedSubtotal + originalShippingCost;

    const previousState = {
      status: order.status,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      items: order.items.map((item) => ({
        productId: item.productId,
        requestedQuantity: Number(item.requestedQuantity),
        pickedQuantity: Number(item.pickedQuantity),
        status: item.status,
        substitutedWithId: item.substitutedWithId,
      })),
    };

    // 4. Persistir los resultados definitivos en la base de datos a través del repositorio
    const updatedOrder = await orderRepository.updatePickingResults(
      orderId,
      pickerId,
      pickingItems.map((item) => ({
        productId: item.productId,
        pickedQuantity: item.pickedQuantity,
        status: item.status,
        substitutedWithId: item.substitutedWithId || null,
      })),
      calculatedSubtotal,
      calculatedTotal,
    );
    // 5. Crear la captura del nuevo estado resultante
    const newState = {
      status: updatedOrder.status,
      subtotal: Number(updatedOrder.subtotal),
      total: Number(updatedOrder.total),
      items: updatedOrder.items.map((item) => ({
        productId: item.productId,
        requestedQuantity: Number(item.requestedQuantity),
        pickedQuantity: Number(item.pickedQuantity),
        status: item.status,
        substitutedWithId: item.substitutedWithId,
      })),
    };

    // 6. Guardar de forma asíncrona la auditoría
    await auditLogRepository.create({
      action: `PICKER_COMPLETED_ORDER_PREPARATION`, // Nombre de la acción
      performedById: pickerId, // Quién la hizo (el Picker)
      orderId: orderId, // ID de la orden afectada
      previousState, // Snapshot de antes del picking
      newState, // Snapshot de después del picking
    });

    return updatedOrder;
  }

  /**
   * 6. Asigna el repartidor a la orden.
   */
  async assignDelivery(id: string, deliveryPersonId: string) {
    return await orderRepository.assignDelivery(id, deliveryPersonId);
  }
}

export const orderService = new OrderService();
