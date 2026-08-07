import { Payment } from "../types/shared.types.ts";
import { PaymentStatus } from "../../../generated/prisma/enums.ts";
import { prisma } from "../db.ts";

export class PaymentRepository {
  async getAll(options?: { page?: number; limit?: number; status?: PaymentStatus }) {
    const page = Math.max(1, options?.page || 1);
    const limit = options?.limit ? Math.max(1, options.limit) : undefined;
    const skip = limit ? (page - 1) * limit : undefined;

    const where: any = {};
    if (options?.status) {
      where.status = options.status;
    }

    const [results, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.payment.count({ where }),
    ]);
    
    const items = results.map((r) => ({
      ...r,
      amount: Number(r.amount),
      createdAt: r.createdAt.getTime(),
      updatedAt: r.updatedAt.getTime()
    })) as Payment[];

    return {
      items,
      total,
      page,
      limit: limit || total,
      totalPages: limit ? Math.ceil(total / limit) || 1 : 1,
    };
  }

  async getByOrderId(orderId: string): Promise<Payment | undefined> {
    const r = await prisma.payment.findUnique({
      where: { orderId }
    });
    if (r) {
      return {
        ...r,
        amount: Number(r.amount),
        createdAt: r.createdAt.getTime(),
        updatedAt: r.updatedAt.getTime()
      } as Payment;
    }
    return undefined;
  }

  async create(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
    const created = await prisma.payment.create({
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
      createdAt: created.createdAt.getTime(),
      updatedAt: created.updatedAt.getTime()
    } as Payment;
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment | undefined> {
    const updated = await prisma.payment.update({
      where: { id },
      data: { status }
    });
    return {
      ...updated,
      amount: Number(updated.amount),
      createdAt: updated.createdAt.getTime(),
      updatedAt: updated.updatedAt.getTime()
    } as Payment;
  }

  async updateReference(orderId: string, reference: string, receiptUrl?: string): Promise<Payment | undefined> {
    const updated = await prisma.payment.update({
      where: { orderId },
      data: {
        reference,
        ...(receiptUrl && { receiptUrl })
      }
    });
    return {
      ...updated,
      amount: Number(updated.amount),
      createdAt: updated.createdAt.getTime(),
      updatedAt: updated.updatedAt.getTime()
    } as Payment;
  }
}

export const paymentRepository = new PaymentRepository();
