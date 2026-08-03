import { Request, Response } from "express";
import { productService } from "../services/productService.ts";
import { AppError } from "../utils/appErrors.ts";

export class ProductController {
  /**
   * Obtiene la lista de todos los productos del catálogo.
   */
  async getAll(req: Request, res: Response): Promise<void> {
    const includeInactive = req.query.includeInactive === "true";
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const subcategoryId = req.query.subcategoryId as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as "relevance" | "price_asc" | "price_desc" | "name_asc" | undefined;
    const isRecommended = req.query.isRecommended === "true";
    const hasDiscount = req.query.hasDiscount === "true";

    // Si se especifican parámetros de paginación o filtros, usamos getPaginatedProducts
    if (page || limit || subcategoryId || categoryId || search || sortBy || isRecommended || hasDiscount) {
      const paginatedResult = await productService.getPaginatedProducts({
        page,
        limit,
        subcategoryId,
        categoryId,
        search,
        sortBy,
        isRecommended,
        hasDiscount,
        includeInactive,
      });
      res.json(paginatedResult);
      return;
    }

    // Si no hay parámetros de paginación, devolver objeto paginado por defecto con limit=12 o todos
    if (req.query.all === "true") {
      const products = await productService.getAllProducts(includeInactive);
      res.json(products);
      return;
    }

    const paginatedResult = await productService.getPaginatedProducts({ includeInactive });
    res.json(paginatedResult);
  }

  /**
   * Obtiene un único producto mediante su identificador único (UUID).
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new AppError("El ID del producto es requerido.", 400);
    }
    const product = await productService.getProductById(id);
    res.json(product);
  }

  /**
   * Coordina la creación de un nuevo producto asumiendo datos previamente validados.
   */
  async create(req: Request, res: Response): Promise<void> {
    const performedByUserId = req.headers["x-user-id"] as string;

    // Separamos la URL de la imagen del resto de los datos comerciales del producto
    const { imageUrl, thumbUrl, ...productData } = req.body;

    // Validación complementaria obligatoria para asegurar el parámetro del servicio
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new AppError("La propiedad 'imageUrl' es obligatoria para registrar el producto.", 400);
    }

    // Enviamos los datos directamente al servicio sin re-validar con Zod
    const product = await productService.createProduct(
      productData,
      imageUrl,
      thumbUrl,
      performedByUserId,
    );

    res.status(201).json(product);
  }

  /**
   * Gestiona la actualización parcial de un producto existente utilizando datos limpios.
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new AppError("El ID del producto es requerido.", 400);
    }
    const performedByUserId =
      (req.headers["x-user-id"] as string) ||
      "8341bc73-f2c7-4f96-a7df-a97003f18b74";

    // Transferimos los cambios directamente al servicio
    const product = await productService.updateProduct(
      id,
      req.body,
      performedByUserId,
    );

    res.json(product);
  }

  /**
   * Obtiene un producto utilizando el código de barras escaneado.
   */
  async getByBarcode(req: Request, res: Response): Promise<void> {
    const { barcode } = req.params;
    if (!barcode) {
      throw new AppError("El código de barras es requerido.", 400);
    }

    const product = await productService.getProductByBarcode(barcode);
    res.json(product);
  }
}

// Exportamos la instancia única (Singleton) para su uso en las rutas
export const productController = new ProductController();
