import { deliveryRepository } from "../repositories/deliveryRepository.ts";
import { DeliveryPerson } from "../types/shared.types.ts";

export class DeliveryService {
  async getAvailableDeliveryPeople(): Promise<DeliveryPerson[]> {
    return await deliveryRepository.getAvailable();
  }

  async getAllDeliveryPeople(): Promise<DeliveryPerson[]> {
    return await deliveryRepository.getAll();
  }

  async setStatus(id: string, status: 'available' | 'busy' | 'offline'): Promise<DeliveryPerson | undefined> {
    return await deliveryRepository.updateStatus(id, status);
  }

  async getProfile(userId: string) {
    return await deliveryRepository.getProfile(userId);
  }
}

export const deliveryService = new DeliveryService();
