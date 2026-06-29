import { Router } from "express";
import { productController } from "../controllers/productController.ts";

const router = Router();

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.patch("/:id", productController.update);

export default router;
