import { Router } from "express";
import { orderController } from "../controllers/orderController.ts";
import { validateResource } from "../middlewares/validate.middleware.ts";
import { createOrderSchema } from "../schemas/orderSchema.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import { authorizeRoles } from "../middlewares/role.middleware.ts";
import { Role } from "../../../generated/prisma/enums.ts";

const router = Router();

// Todas las rutas del módulo de órdenes requieren autenticación previa
router.use(verifyToken);

// 1. Obtener las órdenes pertenecientes al usuario cliente autenticado
router.get("/my-orders", orderController.getMyOrders);

// 2. Crear una nueva orden (Permitido para Clientes y Administradores)
router.post(
  "/",
  authorizeRoles(Role.CLIENTE, Role.ADMINISTRADOR),
  validateResource(createOrderSchema),
  orderController.create,
);

// 3. Obtener todas las órdenes de la tienda (Staff, Delivery y Administradores)
router.get(
  "/",
  authorizeRoles(Role.ADMINISTRADOR, Role.STAFF_PICKER, Role.DELIVERY),
  orderController.getAll,
);

// 4. Obtener detalle de una orden específica por ID
router.get("/:orderId", orderController.getById);

// 5. Actualizar el estado de una orden (Staff, Delivery y Administradores)
router.patch(
  "/:orderId/status",
  authorizeRoles(Role.ADMINISTRADOR, Role.STAFF_PICKER, Role.DELIVERY),
  orderController.updateStatus,
);

// 6. Actualizar items de una orden (Staff y Administradores)
router.patch(
  "/:id/items",
  authorizeRoles(Role.ADMINISTRADOR, Role.STAFF_PICKER),
  orderController.updateItems,
);

// 7. Procesar picking de una orden (Staff y Administradores)
router.patch(
  "/:id/picking",
  authorizeRoles(Role.ADMINISTRADOR, Role.STAFF_PICKER),
  orderController.processPicking,
);

// 8. Asignar repartidor motorizado (Staff, Delivery y Administradores)
router.patch(
  "/:id/assign-delivery",
  authorizeRoles(Role.ADMINISTRADOR, Role.STAFF_PICKER, Role.DELIVERY),
  orderController.assignDelivery,
);

export default router;
