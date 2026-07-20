import { getPrisma } from "../db.ts";

export class CategoryRepository {
  private prisma = getPrisma();

  async getAllWithSubcategories() {
    return await this.prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    return await this.prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
      },
    });
  }

  async getSubcategoryById(id: string) {
    return await this.prisma.subcategory.findUnique({
      where: { id },
    });
  }

  async createCategory(name: string) {
    return await this.prisma.category.create({
      data: { name },
    });
  }

  async updateCategory(id: string, name: string) {
    return await this.prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  async deleteCategory(id: string) {
    return await this.prisma.category.delete({
      where: { id },
    });
  }

  async createSubcategory(name: string, categoryId: string) {
    return await this.prisma.subcategory.create({
      data: { name, categoryId },
    });
  }

  async updateSubcategory(id: string, name: string) {
    return await this.prisma.subcategory.update({
      where: { id },
      data: { name },
    });
  }

  async deleteSubcategory(id: string) {
    return await this.prisma.subcategory.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
