import { prisma } from "../db.ts";

export class CategoryRepository {

  async getAllWithSubcategories() {
    return await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
      },
    });
  }

  async getSubcategoryById(id: string) {
    return await prisma.subcategory.findUnique({
      where: { id },
    });
  }

  async createCategory(name: string) {
    return await prisma.category.create({
      data: { name },
    });
  }

  async updateCategory(id: string, name: string) {
    return await prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  }

  async createSubcategory(name: string, categoryId: string) {
    return await prisma.subcategory.create({
      data: { name, categoryId },
    });
  }

  async updateSubcategory(id: string, name: string) {
    return await prisma.subcategory.update({
      where: { id },
      data: { name },
    });
  }

  async deleteSubcategory(id: string) {
    return await prisma.subcategory.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
