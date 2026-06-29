import { Payment } from "../../../src/types/index.ts";
import { useMock, getPrisma } from "../db.ts";
import { payments } from "../mocks/payments.ts";

export class PaymentRepository {
  async getAll(): Promise<Payment[]> {
    if (!useMock) {
      const prisma = getPrisma();
      try {
        const results = await prisma.payment.findMany({
          orderBy: { createdAt: "desc" }
        });
        return results.map((r: any) => ({
          ...r,
          amount: Number(r.amount),
          createdAt: r.createdAt.getTime()
        })) as any;
      } catch (err) {
        console.error("Error consultando pagos con Prisma, cayendo en Mock", err);
      }
    }
    return payments;
  }

  async getByOrderId(orderId: string): Promise<Payment | undefined> {
    if (!useMock) {
      const prisma = getPrisma();
      try {
        const r: any = await prisma.payment.findUnique({
          where: { orderId }
        });
        if (r) {
          return {
            ...r,
            amount: Number(r.amount),
            createdAt: r.createdAt.getTime()
          } as Payment;
        }
      } catch (err) {
        console.error("Error consultando pago por orden con Prisma, cayendo en Mock", err);
      }
    }
    return payments.find(p => p.orderId === orderId);
  }

  async create(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
    const newPayment: Payment = {
      ...paymentData,
      id: "pay-" + Math.random().toString(36).substring(2, 9)
    };
    if (!useMock) {
      const prisma = getPrisma();
      try {
        const created: any = await prisma.payment.create({
          data: {
            orderId: newPayment.orderId,
            amount: newPayment.amount,
            method: newPayment.method,
            status: newPayment.status,
            reference: newPayment.reference,
            receiptUrl: newPayment.receiptUrl || null
          }
        });
        return {
          ...created,
          amount: Number(created.amount),
          createdAt: created.createdAt.getTime()
        } as Payment;
      } catch (err) {
        console.error("Error guardando pago con Prisma, cargando en Mock", err);
      }
    }
    payments.push(newPayment);
    return newPayment;
  }

  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Payment | undefined> {
    if (!useMock) {
      const prisma = getPrisma();
      try {
        const updated: any = await prisma.payment.update({
          where: { id },
          data: { status }
        });
        return {
          ...updated,
          amount: Number(updated.amount),
          createdAt: updated.createdAt.getTime()
        } as Payment;
      } catch (err) {
        console.error("Error actualizando estado de pago con Prisma, cayendo en Mock", err);
      }
    }
    const idx = payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      payments[idx].status = status;
      return payments[idx];
    }
    return undefined;
  }
}

export const paymentRepository = new PaymentRepository();
