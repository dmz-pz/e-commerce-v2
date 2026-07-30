import { NextFunction, Request, Response } from "express";
import { orderService } from "../services/orderService.ts";
import { AppError } from "../utils/appErrors.ts";

export class OrderController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const todayOnly = req.query.todayOnly === 'true' || req.query.today === 'true';
      const orders = await orderService.getAllOrders({ todayOnly });
      res.json(orders);
    } catch (e: unknown) {
      const error = e as Error;
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(
          "Operación no autorizada. Falta la identidad del usuario.",
          401,
        );
      }
      const orders = await orderService.getUserOrders(userId);
      res.json(orders);
    } catch (e: unknown) {
      const error = e as Error;
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    const orderId = req.params.orderId;
    const user = req.user;
    try {
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
    } catch (e: unknown) {
      const error = e as Error;
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (e: unknown) {
      const error = e as Error;
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    const { orderId } = req.params;
    const { status, pickerId, paymentReference } = req.body;
    let paymentReceiptUrl: string | undefined;

    if (!status) {
      return next(new AppError("El estado (status) es requerido para actualizar la orden.", 400));
    }

    if (req.file) {
      paymentReceiptUrl = `/uploads/payments/${req.file.filename}`;
    }

    const user = req.user;
    try {
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
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (e: unknown) {
      const error = e as Error;
      next(error);
    }
  }

  async updateItems(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { items } = req.body;
    try {
      if (!id) {
        throw new AppError("El ID de la orden es requerido.", 400);
      }
      const order = await orderService.updateItems(id, items);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (e: unknown) {
      const error = e as Error;
      next(error);
    }
  }

  /**
   * Procesa y registra la recolección física (picking) realizada por el empleado.
   */
  async processPicking(req: Request, res: Response, next: NextFunction) {
    const { id: orderId } = req.params; // ID de la orden obtenido de la URL
    const pickerId = req.user?.id || req.body.pickerId;
    const { items } = req.body;

    try {
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
    } catch (e: unknown) {
      const error = e as Error;
      next(error);
    }
  }

  async assignDelivery(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;
    const user = req.user;
    try {
      if (!id) {
        throw new AppError("El ID de la orden es requerido.", 400);
      }
      if (user && user.role === "DELIVERY" && deliveryPersonId !== user.id) {
        throw new AppError("No puedes asignar este pedido a otro repartidor.", 403);
      }

      const order = await orderService.assignDelivery(id, deliveryPersonId, user?.id);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
