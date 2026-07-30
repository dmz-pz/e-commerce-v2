// 📁 Archivo: server/api/repositories/auditLogRepository.ts

import { prisma } from "../db.ts";
import { Prisma } from "../../../generated/prisma/client.ts";

/**
 * Interfaz de entrada purificada. Ahora mapea de forma
 * idéntica las columnas físicas de tu modelo de Prisma.
 */
export interface CreateAuditLogInput {
  action: string;
  performedById: string;
  orderId?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
}

export class AuditLogRepository {
  async getAll() {
    return await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
    });
  }

  /**
   * Inserta un log de auditoría respetando al 100% el modelo real AuditLog.
   */
  async create(input: CreateAuditLogInput): Promise<void> {

    await prisma.auditLog.create({
      data: {
        action: input.action,
        performedById: input.performedById,
        orderId: input.orderId || null,

        // Mapeo seguro de objetos complejos a campos JSONB nativos
        previousState: input.previousState
          ? (input.previousState as Prisma.InputJsonValue)
          : Prisma.DbNull,
        newState: input.newState
          ? (input.newState as Prisma.InputJsonValue)
          : Prisma.DbNull,
      },
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
