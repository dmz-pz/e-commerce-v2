import { Router } from "express";
import { categoryController } from "../controllers/categoryController.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import { authorizeRoles } from "../middlewares/role.middleware.ts";
import { Role } from "../../../generated/prisma/enums.ts";
import { catchAsync } from "../utils/catchAsync.ts";

const router = Router();

// Rutas públicas de lectura para el catálogo
router.get("/", catchAsync(categoryController.getAll));
router.get("/:id", catchAsync(categoryController.getById));

// 🛠️ RUTAS DE ADMINISTRACIÓN: CATEGORÍAS (Requieren autenticación y rol ADMINISTRADOR)
router.post("/", verifyToken, authorizeRoles(Role.ADMINISTRADOR), catchAsync(categoryController.createCategory));
router.patch("/:id", verifyToken, authorizeRoles(Role.ADMINISTRADOR), catchAsync(categoryController.updateCategory));
router.delete("/:id", verifyToken, authorizeRoles(Role.ADMINISTRADOR), catchAsync(categoryController.deleteCategory));

// 🛠️ RUTAS DE ADMINISTRACIÓN: SUBCATEGORÍAS
router.post("/subcategories", verifyToken, authorizeRoles(Role.ADMINISTRADOR), catchAsync(categoryController.createSubcategory));
router.patch("/subcategories/:id", verifyToken, authorizeRoles(Role.ADMINISTRADOR), catchAsync(categoryController.updateSubcategory));
router.delete("/subcategories/:id", verifyToken, authorizeRoles(Role.ADMINISTRADOR), catchAsync(categoryController.deleteSubcategory));

export default router;
