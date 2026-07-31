import { Request, Response } from "express";
import { deliveryService } from "../services/deliveryService.ts";
import { AppError } from "../utils/appErrors.ts";

export class DeliveryController {
  async getAvailable(_req: Request, res: Response) {
    const available = await deliveryService.getAvailableDeliveryPeople();
    res.json(available);
  }

  async getProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Operación no autorizada.", 401);
    }
    const profile = await deliveryService.getProfile(userId);
    res.json(profile);
  }

  async updateStatus(req: Request, res: Response) {
    const userId = req.user?.id;
    const { status } = req.body;
    if (!userId) {
      throw new AppError("Operación no autorizada.", 401);
    }
    if (!status || !["available", "busy", "offline"].includes(status)) {
      throw new AppError("El valor de estado no es válido.", 400);
    }
    const updated = await deliveryService.setStatus(userId, status);
    res.json(updated);
  }
}

export const deliveryController = new DeliveryController();
