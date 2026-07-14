import { NextFunction, Request, Response } from "express";
import { productService } from "../services/productService.ts";

export class ProductController {
  /**
   * Obtiene la lista de todos los productos del catálogo.
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const products = await productService.getAllProducts(includeInactive);

      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene un único producto mediante su identificador único (UUID).
   */
  async getByBarcode(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { barcode } = req.params;
      const product = await productService.getProductByBarcode(barcode);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Coordina la creación de un nuevo producto asumiendo datos previamente validados.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const performedByUserId = req.headers["x-user-id"] as string;

      // Separamos la URL de la imagen del resto de los datos comerciales del producto
      const { imageUrl, ...productData } = req.body;

      // Validación complementaria obligatoria para asegurar el parámetro del servicio
      if (!imageUrl || typeof imageUrl !== "string") {
        res.status(400).json({
          error:
            "La propiedad 'imageUrl' es obligatoria para registrar el producto.",
        });
        return;
      }

      // Enviamos los datos directamente al servicio sin re-validar con Zod
      const product = await productService.createProduct(
        productData,
        imageUrl,
        performedByUserId,
      );

      res.status(201).json(product);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Gestiona la actualización parcial de un producto existente utilizando datos limpios.
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { barcode } = req.params;
      const performedByUserId =
        (req.headers["x-user-id"] as string) ||
        "8341bc73-f2c7-4f96-a7df-a97003f18b74";

      // Transferimos los cambios directamente al servicio
      const product = await productService.updateProduct(
        barcode,
        req.body,
        performedByUserId,
      );

      res.json(product);
    } catch (error: any) {
      next(error);
    }
  }
}

// Exportamos la instancia única (Singleton) para su uso en las rutas
export const productController = new ProductController();
