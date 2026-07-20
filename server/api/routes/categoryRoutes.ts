import { Router } from "express";
import { categoryController } from "../controllers/categoryController.ts";

const router = Router();

// Rutas públicas de lectura para el catálogo
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

// 🛠️ RUTAS DE ADMINISTRACIÓN: CATEGORÍAS
router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

// 🛠️ RUTAS DE ADMINISTRACIÓN: SUBCATEGORÍAS
router.post("/subcategories", categoryController.createSubcategory);
router.patch("/subcategories/:id", categoryController.updateSubcategory);
router.delete("/subcategories/:id", categoryController.deleteSubcategory);

export default router;
