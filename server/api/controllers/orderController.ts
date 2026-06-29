import { Request, Response } from "express";
import { orderService } from "../services/orderService.ts";

export class OrderController {
  async getAll(req: Request, res: Response) {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  async create(req: Request, res: Response) {
    const { customerName, customerID, customerPhone, paymentMethod, items } = req.body;
    try {
      const order = await orderService.createOrder(customerName, customerID, customerPhone, paymentMethod, items);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, pickerId } = req.body;
    try {
      const order = await orderService.updateStatus(id, status, pickerId);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  }

  async updateItems(req: Request, res: Response) {
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
      res.status(400).json({ error: error.message || "Failed to update order items" });
    }
  }

  async assignDelivery(req: Request, res: Response) {
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
      res.status(500).json({ error: "Failed to assign delivery" });
    }
  }
}

export const orderController = new OrderController();
