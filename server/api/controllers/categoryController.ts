import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/categoryService.ts";

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name } = req.body;
      const category = await categoryService.createCategory(name);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const category = await categoryService.updateCategory(id, name);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // --- SUBCATEGORÍAS ---
  async createSubcategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, categoryId } = req.body;
      const subcategory = await categoryService.createSubcategory(
        name,
        categoryId,
      );
      res.status(201).json(subcategory);
    } catch (error) {
      next(error);
    }
  }

  async updateSubcategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const subcategory = await categoryService.updateSubcategory(id, name);
      res.json(subcategory);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubcategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await categoryService.deleteSubcategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
