import { categoryRepository } from "../repositories/categoryRepository.ts";
import { AppError } from "../utils/appErrors.ts";

export class CategoryService {
  async getAllCategories() {
    return await categoryRepository.getAllWithSubcategories();
  }

  async getCategoryById(id: string) {
    const category = await categoryRepository.getById(id);
    if (!category) {
      throw new AppError("La categoría solicitada no existe.", 404);
    }
    return category;
  }

  async createCategory(name: string) {
    if (!name || name.trim().length === 0) {
      throw new AppError("El nombre de la categoría es obligatorio.", 400);
    }
    return await categoryRepository.createCategory(name.trim().toUpperCase());
  }

  async updateCategory(id: string, name: string) {
    const category = await categoryRepository.getById(id);
    if (!category) {
      throw new AppError("La categoría a actualizar no existe.", 404);
    }
    return await categoryRepository.updateCategory(
      id,
      name.trim().toUpperCase(),
    );
  }

  async deleteCategory(id: string) {
    const category = await categoryRepository.getById(id);
    if (!category) {
      throw new AppError("La categoría a eliminar no existe.", 404);
    }
    if (category.subcategories.length > 0) {
      throw new AppError(
        "No se puede eliminar la categoría porque contiene subcategorías asociadas. Elimínelas o reasígnelas primero.",
        400,
      );
    }
    return await categoryRepository.deleteCategory(id);
  }

  // --- MÉTODOS DE SUBCATEGORÍA ---

  async createSubcategory(name: string, categoryId: string) {
    if (!name || name.trim().length === 0) {
      throw new AppError("El nombre de la subcategoría es obligatorio.", 400);
    }

    const category = await categoryRepository.getById(categoryId);
    if (!category) {
      throw new AppError("La categoría padre especificada no existe.", 404);
    }

    try {
      return await categoryRepository.createSubcategory(
        name.trim(),
        categoryId,
      );
    } catch (error: any) {
      // Captura de duplicado por la restricción @@unique([name, categoryId]) de Prisma
      if (error.code === "P2002") {
        throw new AppError(
          "Ya existe una subcategoría con este nombre en esta categoría.",
          409,
        );
      }
      throw error;
    }
  }

  async updateSubcategory(id: string, name: string) {
    const subcategory = await categoryRepository.getSubcategoryById(id);
    if (!subcategory) {
      throw new AppError("La subcategoría a actualizar no existe.", 404);
    }
    return await categoryRepository.updateSubcategory(id, name.trim());
  }

  async deleteSubcategory(id: string) {
    const subcategory = await categoryRepository.getSubcategoryById(id);
    if (!subcategory) {
      throw new AppError("La subcategoría a eliminar no existe.", 404);
    }
    return await categoryRepository.deleteSubcategory(id);
  }
}

export const categoryService = new CategoryService();
