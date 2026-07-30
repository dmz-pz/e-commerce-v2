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
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to retrieve payment records." });
      }
    }
  }

  async getAuditLogs(_req: Request, res: Response) {
    try {
      const logs = await adminService.getAuditLogs();
      res.json(logs);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to query system audit logs." });
      }
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
    } catch (e: unknown) {
      const error = e as Error;
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
  async getDriversCash(_req: Request, res: Response) {
    try {
      const drivers = await adminService.getDriversCash();
      res.json(drivers);
    } catch (e: unknown) {
      const error = e as Error;
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "No se pudo obtener el efectivo pendiente de los motorizados." });
      }
    }
  }

  async getSettlements(_req: Request, res: Response) {
    try {
      const history = await adminService.getSettlements();
      res.json(history);
    } catch (e: unknown) {
      const error = e as Error;
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "No se pudo obtener el historial de liquidaciones." });
      }
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
    } catch (e: unknown) {
      const error = e as Error;
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
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
    } catch (e: unknown) {
      const error = e as Error;
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "No se pudo obtener la lista de personal." });
      }
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
    } catch (e: unknown) {
      const error = e as Error;
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error interno al crear el empleado." });
      }
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
    } catch (e: unknown) {
      const error = e as Error;
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error interno al actualizar el rol." });
      }
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
    } catch (e: unknown) {
      const error = e as Error;
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error interno al dar de baja al empleado." });
      }
    }
  }
}

export const adminController = new AdminController();
