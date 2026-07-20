import { apiClient } from "./apiClient.ts";
import { Category, Subcategory } from "../types/index.ts";

export const categoryService = {
  /**
   * Obtiene el árbol completo de categorías con sus subcategorías anidadas.
   */
  getCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>("/api/categories");
  },

  // --- ADMINISTRACIÓN CATEGORÍAS ---
  createCategory: async (name: string): Promise<Category> => {
    return apiClient.post<Category>("/api/categories", { name });
  },

  updateCategory: async (id: string, name: string): Promise<Category> => {
    return apiClient.patch<Category>(`/api/categories/${id}`, { name });
  },

  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/categories/${id}`);
  },

  // --- ADMINISTRACIÓN SUBCATEGORÍAS ---
  createSubcategory: async (
    name: string,
    categoryId: string,
  ): Promise<Subcategory> => {
    return apiClient.post<Subcategory>("/api/categories/subcategories", {
      name,
      categoryId,
    });
  },

  updateSubcategory: async (id: string, name: string): Promise<Subcategory> => {
    return apiClient.patch<Subcategory>(`/api/categories/subcategories/${id}`, {
      name,
    });
  },

  deleteSubcategory: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/categories/subcategories/${id}`);
  },
};
