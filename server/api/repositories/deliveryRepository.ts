import { DeliveryPerson } from "../../../src/types/index.ts";
import { deliveryPeople } from "../mocks/deliveryPeople.ts";

export class DeliveryRepository {
  async getAll(): Promise<DeliveryPerson[]> {
    return deliveryPeople;
  }

  async getAvailable(): Promise<DeliveryPerson[]> {
    return deliveryPeople.filter(p => p.status === "available");
  }

  async updateStatus(id: string, status: 'available' | 'busy' | 'offline'): Promise<DeliveryPerson | undefined> {
    const person = deliveryPeople.find(p => p.id === id);
    if (person) {
      person.status = status;
      return person;
    }
    return undefined;
  }
}

export const deliveryRepository = new DeliveryRepository();
