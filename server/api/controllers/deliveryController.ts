import { Request, Response, NextFunction } from "express";
import { deliveryService } from "../services/deliveryService.ts";

export class DeliveryController {
  async getAvailable(_req: Request, res: Response, next: NextFunction) {
    try {
      const available = await deliveryService.getAvailableDeliveryPeople();
      res.json(available);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const profile = await deliveryService.getProfile(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { status } = req.body;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (!status || !["available", "busy", "offline"].includes(status)) {
        res.status(400).json({ error: "Invalid status value" });
        return;
      }
      const updated = await deliveryService.setStatus(userId, status);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}

export const deliveryController = new DeliveryController();
