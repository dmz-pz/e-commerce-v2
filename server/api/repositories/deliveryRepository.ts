import { DeliveryPerson } from "../../../src/types/index.ts";
import { prisma } from "../db.ts";
import { Role } from "../../../generated/prisma/enums.ts";

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
      status: p.status.toLowerCase() as any,
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
    const uppercaseStatus = status.toUpperCase() as any;
    
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
      status: profile.status.toLowerCase() as any,
      vehicle: profile.vehiclePlate || "Moto / Vehículo Asignado",
    };
  }
}

export const deliveryRepository = new DeliveryRepository();

