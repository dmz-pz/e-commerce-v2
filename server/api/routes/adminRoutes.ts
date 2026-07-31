import { Router } from "express";
import { adminController } from "../controllers/adminController.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import { authorizeRoles } from "../middlewares/role.middleware.ts";
import { Role } from "../../../generated/prisma/enums.ts";
import { catchAsync } from "../utils/catchAsync.ts";

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles(Role.ADMINISTRADOR));

router.get("/payments", catchAsync(adminController.getAllPayments));
router.get("/audit-logs", catchAsync(adminController.getAuditLogs));
router.patch("/payments/:id", catchAsync(adminController.updatePaymentStatus));

// Liquidaciones de Motorizados (Settlements)
router.get("/drivers/cash", catchAsync(adminController.getDriversCash));
router.get("/settlements", catchAsync(adminController.getSettlements));
router.post("/drivers/:id/settle", catchAsync(adminController.settleCash));

// Gestión de Personal (Staff)
router.get("/users", catchAsync(adminController.getUsers));
router.post("/users", catchAsync(adminController.createStaff));
router.patch("/users/:id/role", catchAsync(adminController.updateUserRole));
router.delete("/users/:id", catchAsync(adminController.deleteUser));

export default router;
