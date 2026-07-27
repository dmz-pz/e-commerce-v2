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

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const profile = await deliveryService.getProfile(userId);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivery profile" });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { status } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!status || !["available", "busy", "offline"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      const updated = await deliveryService.setStatus(userId, status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver status" });
    }
  }
}

export const deliveryController = new DeliveryController();
