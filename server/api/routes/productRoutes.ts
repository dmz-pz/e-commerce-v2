import { Router, Request, Response, NextFunction } from "express";
import { productController } from "../controllers/productController.ts";
import { uploadImage } from "../middlewares/upload.middleware.ts";
import { validateResource } from "../middlewares/validate.middleware.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import { authorizeRoles } from "../middlewares/role.middleware.ts";
import { Role } from "../../../generated/prisma/enums.ts";
import { catchAsync } from "../utils/catchAsync.ts";
import { AppError } from "../utils/appErrors.ts";

import {
  createProductRequestSchema,
  updateProductRequestSchema,
} from "../schemas/productSchema.ts";

const router = Router();

// Middleware validador de que exista la imagen en req.file (convertido a AppError)
const requireProductImage = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.file) {
    throw new AppError("La imagen del producto es obligatoria.", 400);
  }
  next();
};

// Middleware mapeador de la imagen
const parseRouteImage = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.file) {
    req.body.imageUrl = `/uploads/products/${req.file.filename}`;
  }
  next();
};

// 🔍 RUTAS DE LECTURA (PÚBLICAS)
router.get("/", catchAsync(productController.getAll));
router.get("/barcode/:barcode", catchAsync(productController.getByBarcode));
router.get("/:id", catchAsync(productController.getById));

// 🚀 RUTAS DE ESCRITURA (CON CADENA DE MIDDLEWARES CORREGIDA Y RBAC)
router.post(
  "/",
  verifyToken,
  authorizeRoles(Role.ADMINISTRADOR, Role.STAFF_PICKER),
  uploadImage.single("image"), // 1. Lee el formulario multipart y monta req.file
  requireProductImage,
  validateResource(createProductRequestSchema), // 2. Valida la existencia física del archivo binario
  parseRouteImage, // 4. Adjunta de forma segura la imageUrl al body limpio
  catchAsync(productController.create), // 5. Envía el control al método de tu servicio
);

router.patch(
  "/:id",
  verifyToken,
  authorizeRoles(Role.ADMINISTRADOR, Role.STAFF_PICKER),
  uploadImage.single("image"),
  validateResource(updateProductRequestSchema),
  parseRouteImage,
  catchAsync(productController.update),
);

export default router;
