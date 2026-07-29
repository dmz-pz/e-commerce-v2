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

export default router;
