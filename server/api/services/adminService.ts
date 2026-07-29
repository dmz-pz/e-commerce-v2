import { paymentRepository } from "../repositories/paymentRepository.ts";
import { auditLogRepository } from "../repositories/auditLogRepository.ts";
import { orderRepository } from "../repositories/orderRepository.ts";
import { deliveryRepository } from "../repositories/deliveryRepository.ts";
import { OrderStatus } from "../../../src/types/index.ts";
import { AppError } from "../utils/appErrors.ts";

export class AdminService {
  async getAllPayments() {
    return await paymentRepository.getAll();
  }

  async getAuditLogs() {
    return await auditLogRepository.getAll();
  }

  async updatePaymentStatus(id: string, status: string, performedById: string) {
    const previousPayments = await paymentRepository.getAll();
    const currentPay = previousPayments.find(p => p.id === id);

    if (!currentPay) {
      throw new AppError("Pago no encontrado.", 404);
    }

    const updated = await paymentRepository.updateStatus(id, status as any);

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
}

export const adminService = new AdminService();
