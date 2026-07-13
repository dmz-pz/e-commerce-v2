import { Router } from "express";
import { productController } from "../controllers/productController.ts";
import { uploadImage } from "../middlewares/upload.middleware.ts";
import { validateResource } from "../middlewares/validate.middleware.ts";
import { validateBody } from "../middlewares/validateUpload.middleware.ts";
import {
  createProductSchema,
  updateProductRequestSchema,
} from "../schemas/productSchema.ts";

const router = Router();

/**
 * 🛠️ MIDDLEWARE 2: Mapeador de la ruta de imagen.
 * Se ejecuta POST-Zod para evitar que el formateador limpie o remueva la propiedad.
 */
const parseRouteImage = (req: any, res: any, next: any) => {
  if (req.file) {
    req.body.imageUrl = `/uploads/products/${req.file.filename}`;
  }
  next();
};

// 🔍 RUTAS DE LECTURA (PÚBLICAS)
router.get("/", productController.getAll);
router.get("/:id", productController.getById);

// 🚀 RUTAS DE ESCRITURA (CON CADENA DE MIDDLEWARES CORREGIDA)
router.post(
  "/",
  uploadImage.single("image"), // 1. Lee el formulario multipart y monta req.file
  validateBody(createProductSchema), // 2. Valida la existencia física del archivo binario
  parseRouteImage, // 4. Adjunta de forma segura la imageUrl al body limpio
  productController.create, // 5. Envía el control al método de tu servicio
);

router.patch(
  "/:id",
  uploadImage.single("image"), // 1. Procesa si viene una nueva imagen opcional
  validateResource(updateProductRequestSchema), // 2. Valida tanto los params (id) como los campos parciales del body
  parseRouteImage, // 3. Si se subió foto, actualiza req.body.imageUrl de forma segura
  productController.update, // 4. Envía los cambios combinados al controlador
);

export default router;
