import { Router } from "express";
import { adminController } from "../controllers/adminController.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import { authorizeRoles } from "../middlewares/role.middleware.ts";
import { Role } from "../../../generated/prisma/enums.ts";

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles(Role.ADMINISTRADOR));

router.get("/payments", adminController.getAllPayments);
router.get("/audit-logs", adminController.getAuditLogs);
router.patch("/payments/:id", adminController.updatePaymentStatus);

// Liquidaciones de Motorizados (Settlements)
router.get("/drivers/cash", adminController.getDriversCash);
router.get("/settlements", adminController.getSettlements);
router.post("/drivers/:id/settle", adminController.settleCash);

// Gestión de Personal (Staff)
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createStaff);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

export default router;
