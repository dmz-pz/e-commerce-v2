import { paymentRepository } from "../repositories/paymentRepository.ts";
import { auditLogRepository } from "../repositories/auditLogRepository.ts";
import { orderRepository } from "../repositories/orderRepository.ts";
import { deliveryRepository } from "../repositories/deliveryRepository.ts";
import { userRepository } from "../repositories/userRepository.ts";

import { AppError } from "../utils/appErrors.ts";
import { Role, PaymentStatus, OrderStatus } from "../../../generated/prisma/enums.ts";
import bcrypt from "bcrypt";
import { prisma } from "../db.ts";

export interface CreateStaffDTO {
  cedula: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password?: string;
  role: Role;
}

export class AdminService {
  async getAllPayments() {
    return await paymentRepository.getAll();
  }

  async getAuditLogs() {
    return await auditLogRepository.getAll();
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, performedById: string) {
    const previousPayments = await paymentRepository.getAll();
    const currentPay = previousPayments.find(p => p.id === id);

    if (!currentPay) {
      throw new AppError("Pago no encontrado.", 404);
    }

    const updated = await paymentRepository.updateStatus(id, status);

    if (updated) {
      const order = await orderRepository.getById(updated.orderId);
      if (order) {
        if (status === "APPROVED") {
          await orderRepository.updateStatus(updated.orderId, OrderStatus.READY_TO_PAY);
        } else if (status === "REJECTED") {
          await orderRepository.updateStatus(updated.orderId, OrderStatus.CANCELLED);
        }
      }

      await auditLogRepository.create({
        orderId: updated.orderId,
        action: `Verificación manual de Depósito/Pago: Referencia ${updated.reference} marcada como ${status}`,
        performedById,
        previousState: { status: currentPay.status },
        newState: { status: updated.status }
      });

      return updated;
    } else {
      throw new AppError("No se pudo actualizar el estado del pago.", 400);
    }
  }

  async getDriversCash() {
    return await deliveryRepository.getDriversWithPendingCash();
  }

  async getSettlements() {
    return await deliveryRepository.getSettlementHistory();
  }

  async settleCash(driverId: string, performedById: string) {
    const settlement = await deliveryRepository.settleDriverCash(driverId, performedById);

    await auditLogRepository.create({
      action: `Liquidación de Efectivo: Se recibió $${settlement.amount} del motorizado ID ${driverId}`,
      performedById,
    });
    return settlement;
  }

  // --- STAFF MANAGEMENT ---
  async getUsers(role?: Role) {
    return await userRepository.getAll({ role });
  }

  async createStaff(userData: CreateStaffDTO, performedById: string) {
    // Validación 1: Email único
    const existingEmail = await userRepository.getByEmail(userData.email);
    if (existingEmail) {
      throw new AppError("El correo electrónico ya está registrado.", 400);
    }

    // Validación 2: Cédula única
    const users = await userRepository.getAll();
    if (users.find(u => u.cedula === userData.cedula)) {
      throw new AppError("La cédula ya se encuentra registrada.", 400);
    }

    const pass = userData.password || "123456";
    const hashedPassword = (await bcrypt.hash(pass, 10)) as string;

    const newUser = await userRepository.create({
      cedula: userData.cedula,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      email: userData.email,
      passwordHash: hashedPassword,
      role: userData.role as Role,
    });

    if (userData.role === Role.DELIVERY) {
      await prisma.deliveryProfile.create({
        data: {
          userId: newUser.id,
          status: "OFFLINE",
          cashInHand: 0.0
        }
      });
    }

    await auditLogRepository.create({
      action: `Alta de empleado: Se registró a ${newUser.firstName} con rol ${newUser.role}`,
      performedById,
    });

    return newUser;
  }

  async updateUserRole(id: string, role: string, performedById: string) {
    const user = await userRepository.getById(id);
    if (!user) throw new AppError("Usuario no encontrado.", 404);

    const updatedUser = await userRepository.updateRole(id, role as Role);

    if (role === Role.DELIVERY) {
      // Verificar si ya tiene perfil, de lo contrario crearlo
      const profile = await prisma.deliveryProfile.findUnique({ where: { userId: id } });
      if (!profile) {
        await prisma.deliveryProfile.create({
          data: {
            userId: id,
            status: "OFFLINE",
            cashInHand: 0.0
          }
        });
      }
    }

    await auditLogRepository.create({
      action: `Cambio de Rol: El empleado ${user.firstName} cambió de ${user.role} a ${role}`,
      performedById,
    });

    return updatedUser;
  }

  async deleteUser(id: string, performedById: string) {
    const user = await userRepository.getById(id);
    if (!user) throw new AppError("Usuario no encontrado.", 404);

    const deleted = await userRepository.softDelete(id);

    await auditLogRepository.create({
      action: `Baja de empleado: Se eliminó/desactivó a ${user.firstName} (Rol: ${user.role})`,
      performedById,
    });

    return deleted;
  }
}

export const adminService = new AdminService();
