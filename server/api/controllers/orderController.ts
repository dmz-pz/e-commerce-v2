import { Request, Response } from "express";
import { orderService } from "../services/orderService.ts";
import { AppError } from "../utils/appErrors.ts";

export class OrderController {
  async getAll(req: Request, res: Response) {
    const todayOnly = req.query.todayOnly === 'true' || req.query.today === 'true';
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const orders = await orderService.getAllOrders({ todayOnly, page, limit });
    res.json(orders);
  }

  async getMyOrders(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Operación no autorizada. Falta la identidad del usuario.",
        401,
      );
    }
    const orders = await orderService.getUserOrders(userId);
    res.json(orders);
  }

  async getById(req: Request, res: Response) {
    const orderId = req.params.orderId;
    const user = req.user;

    const order = await orderService.getOrderById(orderId || "");
    if (!order) {
      throw new AppError("La orden solicitada no fue encontrada", 404);
    }

    // Si el usuario es cliente, validar que la orden le pertenezca
    if (
      user &&
      !["ADMINISTRADOR", "STAFF_PICKER", "DELIVERY"].includes(user.role)
    ) {
      if (order.customerId !== user.id) {
        throw new AppError(
          "No tienes permisos para visualizar esta orden.",
          403,
        );
      }
    }

    res.json(order);
  }

  async create(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Operación no autorizada. Falta la identidad del usuario.",
        401,
      );
    }
    const items = req.body;

    const order = await orderService.createOrder(userId, items);
    res.status(201).json(order);
  }

  async updateStatus(req: Request, res: Response) {
    const { orderId } = req.params;
    const { status, pickerId, paymentReference } = req.body;
    let paymentReceiptUrl: string | undefined;

    if (!status) {
      throw new AppError("El estado (status) es requerido para actualizar la orden.", 400);
    }

    if (req.file) {
      paymentReceiptUrl = `/uploads/payments/${req.file.filename}`;
    }

    const user = req.user;

    if (!orderId) {
      throw new AppError("El ID de la orden es requerido.", 400);
    }
    if (user && user.role === "DELIVERY" && status === "DELIVERED") {
      const existingOrder = await orderService.getOrderById(orderId);
      const activeJob = (existingOrder as unknown as { deliveryJobs?: { deliveryPersonId: string }[] })?.deliveryJobs?.[0];
      if (activeJob?.deliveryPersonId !== user.id) {
        throw new AppError("No tienes permisos para marcar como entregada esta orden.", 403);
      }
    }

    const order = await orderService.updateStatus(orderId, status, pickerId, user?.id, paymentReference, paymentReceiptUrl);
    if (!order) {
      throw new AppError("La orden solicitada no fue encontrada", 404);
    }
    res.json(order);
  }

  async updateItems(req: Request, res: Response) {
    const { id } = req.params;
    const { items } = req.body;

    if (!id) {
      throw new AppError("El ID de la orden es requerido.", 400);
    }
    const order = await orderService.updateItems(id, items);
    if (!order) {
      throw new AppError("La orden solicitada no fue encontrada", 404);
    }
    res.json(order);
  }

  /**
   * Procesa y registra la recolección física (picking) realizada por el empleado.
   */
  async processPicking(req: Request, res: Response) {
    const { id: orderId } = req.params;
    const pickerId = req.user?.id || req.body.pickerId;
    const { items } = req.body;

    if (!pickerId) {
      throw new AppError(
        "Se requiere la identidad del picker para procesar esta operación.",
        401,
      );
    }

    if (!items || !Array.isArray(items)) {
      throw new AppError(
        "El formato de los productos recolectados no es válido.",
        400,
      );
    }

    const updatedOrder = await orderService.processPicking(
      orderId || "",
      pickerId,
      items,
    );
    res.json(updatedOrder);
  }

  async assignDelivery(req: Request, res: Response) {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;
    const user = req.user;

    if (!id) {
      throw new AppError("El ID de la orden es requerido.", 400);
    }
    if (user && user.role === "DELIVERY" && deliveryPersonId !== user.id) {
      throw new AppError("No puedes asignar este pedido a otro repartidor.", 403);
    }

    const order = await orderService.assignDelivery(id, deliveryPersonId, user?.id);
    if (!order) {
      throw new AppError("La orden solicitada no fue encontrada", 404);
    }
    res.json(order);
  }
}

export const orderController = new OrderController();
