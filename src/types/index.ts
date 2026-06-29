/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OrderStatus {
  PENDING = 'pending',
  PICKING = 'picking',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: string;
  subcategory: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  specifications?: Record<string, string>;
  imageUrl: string;
  unit: string; // e.g., 'kg', 'unit', 'pack'
  isRecommended?: boolean;
  salesCount?: number;
  isActive?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerID: string; // Cedula
  customerPhone: string;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  pickerId?: string; // ID of the staff member picking the order
  deliveryPersonId?: string; // ID of the assigned motorizado
}

export interface DeliveryPerson {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  vehicle: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  change: number;
  reason: string;
  timestamp: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reference: string;
  receiptUrl?: string; // Captura de depósito simulada
  createdAt: number;
}

export interface AuditLog {
  id: string;
  orderId?: string;
  action: string;
  performedById: string;
  performedByName: string;
  previousState?: any;
  newState?: any;
  timestamp: number;
}

