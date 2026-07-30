import { DeliveryPerson } from "../types/shared.types.ts";
import { prisma } from "../db.ts";
import { AppError } from "../utils/appErrors.ts";

export class DeliveryRepository {
  

  async getAll(): Promise<DeliveryPerson[]> {
    const deliveryProfiles = await prisma.deliveryProfile.findMany({
      include: {
        user: true
      }
    });

    return deliveryProfiles.map(p => ({
      id: p.userId,
      name: `${p.user.firstName} ${p.user.lastName}`.trim(),
      phone: p.user.phone,
      status: p.status.toLowerCase() as 'available' | 'busy' | 'offline',
      vehicle: p.vehiclePlate || "Moto / Vehículo Asignado",
    }));
  }

  async getAvailable(): Promise<DeliveryPerson[]> {
    const all = await this.getAll();
    return all.filter(p => p.status === "available");
  }

  async getProfile(userId: string) {
    let profile = await prisma.deliveryProfile.findUnique({
      where: { userId },
      include: { user: true }
    });
    
    if (!profile) {
      profile = await prisma.deliveryProfile.create({
        data: {
          userId,
          status: "OFFLINE",
          cashInHand: 0.0
        },
        include: { user: true }
      });
    }
    
    return {
      userId: profile.userId,
      status: profile.status.toLowerCase(),
      cashInHand: Number(profile.cashInHand),
      vehiclePlate: profile.vehiclePlate
    };
  }

  async updateStatus(id: string, status: 'available' | 'busy' | 'offline'): Promise<DeliveryPerson | undefined> {
    const uppercaseStatus = status.toUpperCase() as "AVAILABLE" | "BUSY" | "OFFLINE";
    
    // First ensure the user has a profile
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return undefined;
    
    const profile = await prisma.deliveryProfile.upsert({
      where: { userId: id },
      create: {
        userId: id,
        status: uppercaseStatus,
      },
      update: {
        status: uppercaseStatus,
      },
      include: {
        user: true
      }
    });

    return {
      id: profile.userId,
      name: `${profile.user.firstName} ${profile.user.lastName}`.trim(),
      phone: profile.user.phone,
      status: profile.status.toLowerCase() as 'available' | 'busy' | 'offline',
      vehicle: profile.vehiclePlate || "Moto / Vehículo Asignado",
    };
  }

  // ==========================================
  // METODOS DE LIQUIDACIÓN DE EFECTIVO
  // ==========================================
  async getDriversWithPendingCash() {
    const profiles = await prisma.deliveryProfile.findMany({
      where: {
        cashInHand: { gt: 0 }
      },
      include: { user: true }
    });

    return profiles.map(p => ({
      id: p.userId,
      name: `${p.user.firstName} ${p.user.lastName}`.trim(),
      cashInHand: Number(p.cashInHand),
      status: p.status
    }));
  }

  async settleDriverCash(driverId: string, adminId: string) {
    return await prisma.$transaction(async (tx) => {
      const profile = await tx.deliveryProfile.findUnique({ where: { userId: driverId } });
      if (!profile || Number(profile.cashInHand) <= 0) {
        throw new AppError("El repartidor no tiene efectivo pendiente por rendir.", 400);
      }

      const amount = profile.cashInHand;

      // 1. Crear recibo de liquidación
      const settlement = await tx.driverSettlement.create({
        data: {
          deliveryPersonId: driverId,
          amount: amount,
          status: "APPROVED",
          reviewedById: adminId
        }
      });

      // 2. Resetear la bolsa del repartidor a 0
      await tx.deliveryProfile.update({
        where: { userId: driverId },
        data: { cashInHand: 0.0 }
      });

      return settlement;
    });
  }

  async getSettlementHistory() {
    const settlements = await prisma.driverSettlement.findMany({
      include: {
        deliveryPerson: true,
        reviewedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return settlements.map(s => ({
      id: s.id,
      driverName: `${s.deliveryPerson.firstName} ${s.deliveryPerson.lastName}`.trim(),
      amount: Number(s.amount),
      status: s.status,
      reviewedByName: s.reviewedBy ? `${s.reviewedBy.firstName} ${s.reviewedBy.lastName}`.trim() : 'Sistema',
      createdAt: s.createdAt
    }));
  }
}

export const deliveryRepository = new DeliveryRepository();

