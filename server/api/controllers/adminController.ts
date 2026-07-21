import { Request, Response } from "express";
import { paymentRepository } from "../repositories/paymentRepository.ts";
import { auditLogRepository } from "../repositories/auditLogRepository.ts";
import { orderRepository } from "../repositories/orderRepository.ts";
import { OrderStatus } from "../../../src/types/index.ts";

export class AdminController {
  async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await paymentRepository.getAll();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve payment records." });
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await auditLogRepository.getAll();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to query system audit logs." });
    }
  }

  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'PENDING'
      const performedById = (req.headers["x-user-id"] as string) || "admin-1";

      const previousPayments = await paymentRepository.getAll();
      const currentPay = previousPayments.find(p => p.id === id);

      if (!currentPay) {
        res.status(404).json({ error: "Pago no encontrado." });
        return;
      }

      const updated = await paymentRepository.updateStatus(id, status);

      if (updated) {
        // Update order status based on payment decision
        const order = await orderRepository.getById(updated.orderId);
        if (order) {
          if (status === "APPROVED") {
            // Once payment is approved, the order becomes ready/paid
            await orderRepository.updateStatus(updated.orderId, OrderStatus.READY_TO_PAY);
          } else if (status === "REJECTED") {
            // Cancel the order if payment was invalid/rejected
            await orderRepository.updateStatus(updated.orderId, OrderStatus.CANCELLED);
          }
        }

        // Register to audit logs
        await auditLogRepository.create({
          orderId: updated.orderId,
          action: `Verificación manual de Depósito/Pago: Referencia ${updated.reference} marcada como ${status}`,
          performedById,
          previousState: { status: currentPay.status },
          newState: { status: updated.status }
        });

        res.json(updated);
      } else {
        res.status(400).json({ error: "No se pudo actualizar el estado del pago." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const adminController = new AdminController();
