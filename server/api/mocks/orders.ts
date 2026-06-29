import { Order, OrderStatus } from "../../../src/types/index.ts";

export let orders: Order[] = [
  {
    id: "ord-8421",
    customerName: "Isabella Rodriguez",
    customerID: "V-20123456",
    customerPhone: "0412-5551234",
    paymentMethod: "Pago Móvil",
    items: [
      { productId: "6", name: "Aguacate Haas 1kg", price: 4.20, quantity: 2 },
      { productId: "7", name: "Yogur Griego Natural", price: 1.50, quantity: 1 }
    ],
    total: 9.90,
    status: OrderStatus.PICKING,
    createdAt: Date.now() - 600000,
    updatedAt: Date.now() - 300000,
    pickerId: "staff-1"
  },
  {
    id: "ord-1255",
    customerName: "Mateo Sanchez",
    customerID: "V-18987654",
    customerPhone: "0424-9876543",
    paymentMethod: "Zelle",
    items: [
      { productId: "1", name: "Leche Entera 1L", price: 1.25, quantity: 3 },
      { productId: "4", name: "Pan Artesanal Sourdough", price: 3.50, quantity: 1 }
    ],
    total: 7.25,
    status: OrderStatus.PENDING,
    createdAt: Date.now() - 120000,
    updatedAt: Date.now() - 120000
  }
];
