import { Router } from "express";
import { orderController } from "../controllers/orderController.ts";
import { validateResource } from "../middlewares/validate.middleware.ts";
import { createOrderSchema } from "../schemas/orderSchema.ts";

const router = Router();

router.get("/", orderController.getAll);
router.get("/:orderId", orderController.getById);

router.post("/", validateResource(createOrderSchema), orderController.create);
router.patch("/:orderId/status", orderController.updateStatus);
router.patch("/:id/items", orderController.updateItems);
router.patch("/:id/picking", orderController.processPicking);
router.patch("/:id/assign-delivery", orderController.assignDelivery);

export default router;
