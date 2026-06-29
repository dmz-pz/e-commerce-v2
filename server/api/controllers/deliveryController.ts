import { Request, Response } from "express";
import { deliveryService } from "../services/deliveryService.ts";

export class DeliveryController {
  async getAvailable(req: Request, res: Response) {
    try {
      const available = await deliveryService.getAvailableDeliveryPeople();
      res.json(available);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivery people" });
    }
  }
}

export const deliveryController = new DeliveryController();
