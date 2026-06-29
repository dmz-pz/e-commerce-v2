import { Router } from "express";
import { adminController } from "../controllers/adminController.ts";

const router = Router();

router.get("/payments", adminController.getAllPayments);
router.get("/audit-logs", adminController.getAuditLogs);
router.patch("/payments/:id", adminController.updatePaymentStatus);

export default router;
