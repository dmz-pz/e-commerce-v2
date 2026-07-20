import { Router } from "express";
import { productController } from "../controllers/productController.ts";
import { uploadImage } from "../middlewares/upload.middleware.ts";
import { validateResource } from "../middlewares/validate.middleware.ts";
import {
  createProductRequestSchema,
  updateProductRequestSchema,
} from "../schemas/productSchema.ts";

const router = Router();

// Middleware validador de que exista la imagen en req.file
const requireProductImage = (req: any, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({
      status: "fail",
      message: "La imagen del producto es obligatoria.",
    });
  }
  next();
};

// Middleware mapeador de la imagen
const parseRouteImage = (req: any, res: any, next: any) => {
  if (req.file) {
    req.body.imageUrl = `/uploads/products/${req.file.filename}`;
  }
  next();
};

// 🔍 RUTAS DE LECTURA (PÚBLICAS)
router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.get("/barcode/:barcode", productController.getByBarcode);

// 🚀 RUTAS DE ESCRITURA (CON CADENA DE MIDDLEWARES CORREGIDA)
router.post(
  "/",

  uploadImage.single("image"), // 1. Lee el formulario multipart y monta req.file
  requireProductImage,
  validateResource(createProductRequestSchema), // 2. Valida la existencia física del archivo binario
  parseRouteImage, // 4. Adjunta de forma segura la imageUrl al body limpio
  productController.create, // 5. Envía el control al método de tu servicio
);

router.patch(
  "/:id",
  uploadImage.single("image"),
  validateResource(updateProductRequestSchema),
  parseRouteImage,
  productController.update,
);

export default router;
