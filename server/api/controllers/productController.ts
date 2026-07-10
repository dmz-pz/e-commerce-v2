import { Request, Response } from "express";
import { productService } from "../services/productService.ts";

export class ProductController {
  /**
   * Obtiene la lista de todos los productos del catálogo.
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const products = await productService.getAllProducts(includeInactive);

      res.json(products);
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Error interno al obtener los productos del catálogo.",
        });
    }
  }

  /**
   * Obtiene un único producto mediante su identificador único (UUID).
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (product) {
        res.json(product);
      } else {
        res
          .status(404)
          .json({ error: `El producto con el ID ${id} no fue encontrado.` });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error interno al procesar la búsqueda del producto." });
    }
  }

  /**
   * Coordina la creación de un nuevo producto asumiendo datos previamente validados.
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const performedByUserId = (req.headers["x-user-id"] as string) || "admin";

      // Separamos la URL de la imagen del resto de los datos comerciales del producto
      const { imageUrl, ...productData } = req.body;

      // Validación complementaria obligatoria para asegurar el parámetro del servicio
      if (!imageUrl || typeof imageUrl !== "string") {
        res
          .status(400)
          .json({
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
      // Captura errores de lógica de negocio (ej: discountPrice >= price) lanzados por el servicio
      res
        .status(400)
        .json({
          error: error.message || "Error al intentar registrar el producto.",
        });
    }
  }

  /**
   * Gestiona la actualización parcial de un producto existente utilizando datos limpios.
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const performedByUserId = (req.headers["x-user-id"] as string) || "admin";

      // Transferimos los cambios directamente al servicio
      const product = await productService.updateProduct(
        id,
        req.body,
        performedByUserId,
      );

      res.json(product);
    } catch (error: any) {
      // Si el servicio determina que el producto no existe, respondemos con 404 Not Found
      if (error.message.includes("no existe")) {
        res.status(404).json({ error: error.message });
        return;
      }

      res
        .status(400)
        .json({
          error: error.message || "Error al intentar actualizar el producto.",
        });
    }
  }
}

// Exportamos la instancia única (Singleton) para su uso en las rutas
export const productController = new ProductController();
