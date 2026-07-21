import { DeliveryPerson } from "../../../src/types/index.ts";
import { getPrisma } from "../db.ts";
import { Role, OrderStatus } from "../../../generated/prisma/enums.ts";

export class DeliveryRepository {
  private get prisma() {
    return getPrisma();
  }

  async getAll(): Promise<DeliveryPerson[]> {
    const deliveryUsers = await this.prisma.user.findMany({
      where: {
        role: Role.DELIVERY,
        deletedAt: null,
      },
    });

    const activeOrders = await this.prisma.order.findMany({
      where: {
        status: {
          notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        },
        deliveryPersonId: {
          not: null,
        },
      },
      select: {
        deliveryPersonId: true,
      },
    });

    const busyDriverIds = new Set(activeOrders.map(o => o.deliveryPersonId).filter(Boolean) as string[]);

    return deliveryUsers.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`.trim(),
      phone: u.phone,
      status: busyDriverIds.has(u.id) ? "busy" : "available",
      vehicle: "Moto / Vehículo Asignado",
    }));
  }

  async getAvailable(): Promise<DeliveryPerson[]> {
    const all = await this.getAll();
    return all.filter(p => p.status === "available");
  }

  async updateStatus(id: string, status: 'available' | 'busy' | 'offline'): Promise<DeliveryPerson | undefined> {
    const all = await this.getAll();
    const person = all.find(p => p.id === id);
    if (person) {
      person.status = status;
      return person;
    }
    return undefined;
  }
}

export const deliveryRepository = new DeliveryRepository();
