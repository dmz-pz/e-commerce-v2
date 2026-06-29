import { Router } from "express";
import { orderController } from "../controllers/orderController.ts";

const router = Router();

router.get("/", orderController.getAll);
router.post("/", orderController.create);
router.patch("/:id/status", orderController.updateStatus);
router.patch("/:id/items", orderController.updateItems);
router.patch("/:id/assign-delivery", orderController.assignDelivery);

export default router;
