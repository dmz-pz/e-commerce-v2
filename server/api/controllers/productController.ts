import { Request, Response } from "express";
import { productService } from "../services/productService.ts";

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const products = await productService.getAllProducts(includeInactive);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, price, discountPrice, stock, category, subcategory, brand, imageUrl, unit, isActive, isRecommended } = req.body;
      const performedByUserId = (req.headers["x-user-id"] as string) || "admin";

      if (!name || !price || !imageUrl) {
        res.status(400).json({ error: "Campos requeridos faltantes: nombre, precio, e imagen son obligatorios." });
        return;
      }

      const product = await productService.createProduct({
        name,
        description: description || "",
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stock: stock !== undefined ? Number(stock) : 0,
        category: category || "General",
        subcategory: subcategory || "General",
        brand,
        imageUrl,
        unit: unit || "unid",
        isActive: isActive !== false,
        isRecommended: !!isRecommended,
      }, performedByUserId);

      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const performedByUserId = (req.headers["x-user-id"] as string) || "admin";
      
      const product = await productService.updateProduct(id, req.body, performedByUserId);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const productController = new ProductController();
