import { Payment } from "../../../src/types/index.ts";

export let payments: Payment[] = [
  {
    id: "pay-1",
    orderId: "ord-8421",
    amount: 9.90,
    method: "Pago Móvil",
    status: "APPROVED",
    reference: "REF-123456",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop",
    createdAt: Date.now() - 300000
  },
  {
    id: "pay-2",
    orderId: "ord-1255",
    amount: 7.25,
    method: "Zelle",
    status: "PENDING",
    reference: "REF-987654",
    receiptUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=400&auto=format&fit=crop",
    createdAt: Date.now() - 120000
  }
];
