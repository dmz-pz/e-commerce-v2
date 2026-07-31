import { Request, Response } from "express";
import { categoryService } from "../services/categoryService.ts";
import { AppError } from "../utils/appErrors.ts";

export class CategoryController {
  async getAll(_req: Request, res: Response): Promise<void> {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  }

  async getById(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new AppError("El ID de categoría es requerido.", 400);
    }
    const category = await categoryService.getCategoryById(id);
    res.json(category);
  }

  async createCategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { name } = req.body;
    const category = await categoryService.createCategory(name);
    res.status(201).json(category);
  }

  async updateCategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new AppError("El ID de categoría es requerido.", 400);
    }
    const { name } = req.body;
    const category = await categoryService.updateCategory(id, name);
    res.json(category);
  }

  async deleteCategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new AppError("El ID de categoría es requerido.", 400);
    }
    await categoryService.deleteCategory(id);
    res.status(204).send();
  }

  // --- SUBCATEGORÍAS ---
  async createSubcategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { name, categoryId } = req.body;
    const subcategory = await categoryService.createSubcategory(
      name,
      categoryId,
    );
    res.status(201).json(subcategory);
  }

  async updateSubcategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new AppError("El ID de subcategoría es requerido.", 400);
    }
    const { name } = req.body;
    const subcategory = await categoryService.updateSubcategory(id, name);
    res.json(subcategory);
  }

  async deleteSubcategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new AppError("El ID de subcategoría es requerido.", 400);
    }
    await categoryService.deleteSubcategory(id);
    res.status(204).send();
  }
}

export const categoryController = new CategoryController();
