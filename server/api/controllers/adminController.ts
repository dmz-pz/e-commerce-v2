import { Request, Response } from "express";
import { adminService } from "../services/adminService.ts";
import { AppError } from "../utils/appErrors.ts";

export class AdminController {
  async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await adminService.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve payment records." });
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await adminService.getAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to query system audit logs." });
    }
  }

  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const performedById = (req as any).user.id;

      const updated = await adminService.updatePaymentStatus(id, status, performedById);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  // ==========================================
  // MÉTODOS DE LIQUIDACIÓN DE MOTORIZADOS
  // ==========================================
  async getDriversCash(req: Request, res: Response) {
    try {
      const drivers = await adminService.getDriversCash();
      res.json(drivers);
    } catch (error: any) {
      res.status(500).json({ error: "No se pudo obtener el efectivo pendiente de los motorizados." });
    }
  }

  async getSettlements(req: Request, res: Response) {
    try {
      const history = await adminService.getSettlements();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: "No se pudo obtener el historial de liquidaciones." });
    }
  }

  async settleCash(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const performedById = (req as any).user.id;

      const settlement = await adminService.settleCash(id, performedById);
      res.json(settlement);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
}

export const adminController = new AdminController();
