import { PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums.ts";

export interface DeliveryPerson {
  id: string;
  name: string;
  phone?: string;
  status: 'available' | 'busy' | 'offline';
  vehicle: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  receiptUrl?: string | null;
  reviewedById?: string;
  createdAt: number | string;
  updatedAt: number | string;
}
