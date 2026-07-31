import { Request, Response } from "express";
import { adminService } from "../services/adminService.ts";
import { AppError } from "../utils/appErrors.ts";
import { Role, PaymentStatus } from "../../../generated/prisma/enums.ts";

export class AdminController {
  async getAllPayments(_req: Request, res: Response) {
    try {
      const payments = await adminService.getAllPayments();
      res.json(payments);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to retrieve payment records.", 500);
    }
  }

  async getAuditLogs(_req: Request, res: Response) {
    try {
      const logs = await adminService.getAuditLogs();
      res.json(logs);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to query system audit logs.", 500);
    }
  }

  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const performedById = req.user?.id;
      if (!performedById) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      const updated = await adminService.updatePaymentStatus(id as string, status as PaymentStatus, performedById);
      res.json(updated);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Internal Server Error", 500);
    }
  }

  // ==========================================
  // MÉTODOS DE LIQUIDACIÓN DE MOTORIZADOS
  // ==========================================
  async getDriversCash(_req: Request, res: Response) {
    try {
      const drivers = await adminService.getDriversCash();
      res.json(drivers);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("No se pudo obtener el efectivo pendiente de los motorizados.", 500);
    }
  }

  async getSettlements(_req: Request, res: Response) {
    try {
      const history = await adminService.getSettlements();
      res.json(history);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("No se pudo obtener el historial de liquidaciones.", 500);
    }
  }

  async settleCash(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const performedById = req.user?.id;
      if (!performedById) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      const settlement = await adminService.settleCash(id as string, performedById);
      res.json(settlement);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Internal Server Error", 500);
    }
  }

  // ==========================================
  // MÉTODOS DE GESTIÓN DE PERSONAL
  // ==========================================
  async getUsers(req: Request, res: Response) {
    try {
      const { role } = req.query;
      const users = await adminService.getUsers(role as Role | undefined);
      res.json(users);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("No se pudo obtener la lista de personal.", 500);
    }
  }

  async createStaff(req: Request, res: Response) {
    try {
      const userData = req.body;
      const performedById = req.user?.id;
      if (!performedById) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      const newUser = await adminService.createStaff(userData, performedById);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error interno al crear el empleado.", 500);
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const performedById = req.user?.id;
      if (!performedById) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      const updatedUser = await adminService.updateUserRole(id as string, role, performedById);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error interno al actualizar el rol.", 500);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const performedById = req.user?.id;
      if (!performedById) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      await adminService.deleteUser(id as string, performedById);
      res.json({ message: "Usuario dado de baja exitosamente." });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error interno al dar de baja al empleado.", 500);
    }
  }
}

export const adminController = new AdminController();
