import { Router } from "express";
import { deliveryController } from "../controllers/deliveryController.ts";

const router = Router();

router.get("/available", deliveryController.getAvailable);

export default router;
