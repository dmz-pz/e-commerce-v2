import { AuditLog } from "../../../src/types/index.ts";

export let auditLogs: AuditLog[] = [
  {
    id: "log-1",
    orderId: "ord-8421",
    action: "Asignación de Picker para preparación",
    performedById: "staff-1",
    performedByName: "Carlos Picker",
    previousState: { status: "pending" },
    newState: { status: "picking", pickerId: "staff-1" },
    timestamp: Date.now() - 300000
  },
  {
    id: "log-2",
    orderId: "ord-1255",
    action: "Registro de Nueva Orden en el super",
    performedById: "client-2",
    performedByName: "Mateo Sanchez",
    newState: { status: "pending", total: 7.25 },
    timestamp: Date.now() - 120000
  }
];
