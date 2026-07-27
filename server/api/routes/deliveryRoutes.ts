import { Router } from "express";
import { deliveryController } from "../controllers/deliveryController.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import { authorizeRoles } from "../middlewares/role.middleware.ts";
import { Role } from "../../../generated/prisma/enums.ts";

const router = Router();

router.get("/available", verifyToken, authorizeRoles(Role.ADMINISTRADOR, Role.STAFF_PICKER, Role.DELIVERY), deliveryController.getAvailable);
router.get("/profile", verifyToken, authorizeRoles(Role.DELIVERY), deliveryController.getProfile);
router.put("/status", verifyToken, authorizeRoles(Role.DELIVERY), deliveryController.updateStatus);

export default router;
