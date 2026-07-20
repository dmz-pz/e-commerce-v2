/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// ENUMS (Sincronizados con Prisma)
// ==========================================

export enum Role {
  CLIENTE = "CLIENTE",
  ADMINISTRADOR = "ADMINISTRADOR",
  STAFF_PICKER = "STAFF_PICKER",
  DELIVERY = "DELIVERY",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PICKING = "PICKING",
  READY_TO_PAY = "READY_TO_PAY",
  PAID = "PAID",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum ItemStatus {
  COMPLETED = "COMPLETED",
  PARTIAL = "PARTIAL",
  SUBSTITUTED = "SUBSTITUTED",
  CANCELLED = "CANCELLED",
}

export enum FulfillmentMethod {
  DELIVERY = "DELIVERY",
  PICK_UP = "PICK_UP",
}

export enum PaymentMethod {
  PAGO_MOVIL = "PAGO_MOVIL",
  ZELLE = "ZELLE",
  BINANCE = "BINANCE",
  EFECTIVO_DELIVERY = "EFECTIVO_DELIVERY",
  PUNTO_DELIVERY = "PUNTO_DELIVERY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum UnitType {
  UNID = "UNID",
  KG = "KG",
  GR = "GR",
}

// ==========================================
// MÓDULO 1: USUARIOS, ROLES Y DIRECCIONES
// ==========================================

export interface Address {
  id: string;
  alias: string;
  line1: string;
  line2?: string;
  userId: string;
}

export interface User {
  id: string;
  cedula: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthdate?: string; // Fechas vienen como ISO string desde la API JSON
  role: Role;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ==========================================
// MÓDULO 2: CATÁLOGO DE PRODUCTOS (PIM)
// ==========================================

export interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  category?: Category;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  barcode?: string;
  price: number; // En JSON los Decimales de Prisma se mapean como number o string
  discountPrice?: number;
  stock: number;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  specifications?: Record<string, any>;
  unit: UnitType;
  isRecommended?: boolean;
  salesCount?: number;
  isActive?: boolean;
  subcategoryId: string;
  subcategory?: Subcategory;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MÓDULO 3: TRANSACCIONES Y PICKING
// ==========================================

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  name: string; // Nombre congelado en el momento de la compra
  price: number;
  requestedQuantity: number;
  pickedQuantity: number;
  status: ItemStatus;
  substitutedWithId?: string;
  substitutedWith?: Product;
}

export interface Order {
  id: string;
  customerId: string;
  customer?: User;
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddress?: string;
  customerName: string;
  cedula: string;
  customerPhone: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  payment?: Payment;
  pickerId?: string;
  picker?: User;
  deliveryPersonId?: string;
  deliveryPerson?: User;
  createdAt: string;
  updatedAt: string;
}

// Estrutura auxiliar para el estado local del carrito antes de checkout.
// Contiene únicamente los campos mínimos necesarios para renderizar el carrito
// y construir la orden. El precio se congela en el momento de agregar el ítem.
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// ==========================================
// MÓDULO 4: CONTROL FINANCIERO Y AUDITORÍA
// ==========================================

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  receiptUrl?: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  orderId?: string;
  action: string;
  performedById: string;
  performedBy?: User;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  timestamp: string;
}
