import { Router } from "express";
import { categoryController } from "../controllers/categoryController.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import { authorizeRoles } from "../middlewares/role.middleware.ts";
import { Role } from "../../../generated/prisma/enums.ts";

const router = Router();

// Rutas públicas de lectura para el catálogo
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

// 🛠️ RUTAS DE ADMINISTRACIÓN: CATEGORÍAS (Requieren autenticación y rol ADMINISTRADOR)
router.post("/", verifyToken, authorizeRoles(Role.ADMINISTRADOR), categoryController.createCategory);
router.patch("/:id", verifyToken, authorizeRoles(Role.ADMINISTRADOR), categoryController.updateCategory);
router.delete("/:id", verifyToken, authorizeRoles(Role.ADMINISTRADOR), categoryController.deleteCategory);

// 🛠️ RUTAS DE ADMINISTRACIÓN: SUBCATEGORÍAS
router.post("/subcategories", verifyToken, authorizeRoles(Role.ADMINISTRADOR), categoryController.createSubcategory);
router.patch("/subcategories/:id", verifyToken, authorizeRoles(Role.ADMINISTRADOR), categoryController.updateSubcategory);
router.delete("/subcategories/:id", verifyToken, authorizeRoles(Role.ADMINISTRADOR), categoryController.deleteSubcategory);

export default router;
