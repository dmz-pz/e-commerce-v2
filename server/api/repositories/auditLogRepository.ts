import { AuditLog } from "../../../src/types/index.ts";
import { useMock, getPrisma } from "../db.ts";
import { auditLogs } from "../mocks/auditLogs.ts";

export class AuditLogRepository {
  async getAll(): Promise<AuditLog[]> {
    if (!useMock) {
      const prisma = getPrisma();
      try {
        const results = await prisma.auditLog.findMany({
          orderBy: { timestamp: "desc" }
        });
        return results.map((r: any) => ({
          id: r.id,
          orderId: r.orderId || undefined,
          action: r.action,
          performedById: r.performedById,
          performedByName: "Administrador",
          previousState: typeof r.previousState === "string" ? JSON.parse(r.previousState) : r.previousState,
          newState: typeof r.newState === "string" ? JSON.parse(r.newState) : r.newState,
          timestamp: r.timestamp.getTime()
        }));
      } catch (err) {
        console.error("Error consultando auditorías con Prisma, cayendo en Mock", err);
      }
    }
    return auditLogs;
  }

  async create(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...logData,
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };
    if (!useMock) {
      const prisma = getPrisma();
      try {
        await prisma.auditLog.create({
          data: {
            orderId: newLog.orderId || null,
            action: newLog.action,
            performedById: newLog.performedById,
            previousState: newLog.previousState ? JSON.stringify(newLog.previousState) : null,
            newState: newLog.newState ? JSON.stringify(newLog.newState) : null
          }
        });
      } catch (err) {
        console.error("Error persistiendo log de auditoría con Prisma, cayendo en Mock", err);
      }
    }
    auditLogs.unshift(newLog); // Insert at first index
    return newLog;
  }
}

export const auditLogRepository = new AuditLogRepository();
