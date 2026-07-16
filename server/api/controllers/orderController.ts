import { NextFunction, Request, Response } from "express";
import { orderService } from "../services/orderService.ts";
import { AppError } from "../utils/appErrors.ts";

export class OrderController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    const orderId = req.params.orderId;
    try {
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        throw new AppError("La orden solicitada no fue encontrada", 404);
      }
      res.json(orderId);
    } catch (error: any) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      if (!userId) {
        throw new AppError(
          "Operación no autorizada. Falta la identidad del usuario.",
          401,
        );
      }
      const items = req.body;

      const order = await orderService.createOrder(userId, items);
      res.status(201).json(order);
    } catch (error: any) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { status, pickerId } = req.body;
    try {
      const order = await orderService.updateStatus(id, status, pickerId);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (error: any) {
      next(error);
    }
  }

  async updateItems(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { items } = req.body;
    try {
      const order = await orderService.updateItems(id, items);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Procesa y registra la recolección física (picking) realizada por el empleado.
   */
  async processPicking(req: Request, res: Response, next: NextFunction) {
    const { id: orderId } = req.params; // ID de la orden obtenido de la URL
    const pickerId = (req as any).user?.id || req.body.pickerId;
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
        orderId,
        pickerId,
        items,
      );
      res.json(updatedOrder);
    } catch (error: any) {
      next(error);
    }
  }

  async assignDelivery(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;
    try {
      const order = await orderService.assignDelivery(id, deliveryPersonId);
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
