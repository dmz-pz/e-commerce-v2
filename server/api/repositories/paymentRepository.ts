import { Payment, PaymentStatus } from "../../../src/types/index.ts";
import { getPrisma } from "../db.ts";

export class PaymentRepository {
  async getAll(): Promise<Payment[]> {
    const prisma = getPrisma();
    const results = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" }
    });
    return results.map((r: any) => ({
      ...r,
      amount: Number(r.amount),
      createdAt: r.createdAt.getTime()
    })) as any;
  }

  async getByOrderId(orderId: string): Promise<Payment | undefined> {
    const prisma = getPrisma();
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
    return undefined;
  }

  async create(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
    const prisma = getPrisma();
    const created: any = await prisma.payment.create({
      data: {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        method: paymentData.method,
        status: paymentData.status,
        reference: paymentData.reference,
        receiptUrl: paymentData.receiptUrl || null
      }
    });
    return {
      ...created,
      amount: Number(created.amount),
      createdAt: created.createdAt.getTime()
    } as Payment;
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment | undefined> {
    const prisma = getPrisma();
    const updated: any = await prisma.payment.update({
      where: { id },
      data: { status }
    });
    return {
      ...updated,
      amount: Number(updated.amount),
      createdAt: updated.createdAt.getTime()
    } as Payment;
  }
}

export const paymentRepository = new PaymentRepository();
