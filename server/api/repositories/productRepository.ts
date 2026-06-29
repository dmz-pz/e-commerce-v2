import { Product } from "../../../src/types/index.ts";
import { useMock, getPrisma } from "../db.ts";
import { products } from "../mocks/products.ts";

export class ProductRepository {
  async getAll(includeInactive = false): Promise<Product[]> {
    if (!useMock) {
      const prisma = getPrisma();
      try {
        const results = await prisma.product.findMany({
          where: includeInactive ? {} : { isActive: true },
          orderBy: { createdAt: "desc" },
        });
        return results.map((r: any) => ({
          ...r,
          price: Number(r.price),
          discountPrice: r.discountPrice ? Number(r.discountPrice) : undefined,
          specifications:
            typeof r.specifications === "string"
              ? JSON.parse(r.specifications)
              : r.specifications,
        })) as any;
      } catch (err) {
        console.error("No se pudo consultar con Prisma, cayendo en Mock", err);
      }
    }

    // Default or Fallback to memory
    return includeInactive
      ? products
      : products.filter((p) => p.isActive !== false);
  }

  async getById(id: string): Promise<Product | undefined> {
    if (!useMock) {
      const prisma = getPrisma();
      try {
        const r: any = await prisma.product.findUnique({
          where: { id },
        });
        if (r) {
          return {
            ...r,
            price: Number(r.price),
            discountPrice: r.discountPrice
              ? Number(r.discountPrice)
              : undefined,
            specifications:
              typeof r.specifications === "string"
                ? JSON.parse(r.specifications)
                : r.specifications,
          } as Product;
        }
        return undefined;
      } catch (err) {
        console.error("No se pudo consultar con Prisma, cayendo en Mock", err);
      }
    }

    return products.find((p) => p.id === id);
  }

  async create(productData: Omit<Product, "id">): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substring(2, 9),
      rating: 4.5,
      reviewCount: 1,
      salesCount: 0,
      isActive: productData.isActive !== false,
    };

    if (!useMock) {
      const prisma = getPrisma();
      try {
        const created: any = await prisma.product.create({
          data: {
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            discountPrice: newProduct.discountPrice,
            stock: newProduct.stock,
            brand: newProduct.brand || null,
            rating: newProduct.rating,
            reviewCount: newProduct.reviewCount,
            specifications: newProduct.specifications
              ? JSON.stringify(newProduct.specifications)
              : null,
            imageUrl: newProduct.imageUrl,
            unit: newProduct.unit,
            isActive: newProduct.isActive,
            isRecommended: newProduct.isRecommended || false,
            salesCount: 0,
            subcategory: {
              connectOrCreate: {
                where: {
                  name_categoryId: {
                    name: newProduct.subcategory || "General",
                    categoryId: "1",
                  },
                },
                create: {
                  name: newProduct.subcategory || "General",
                  category: {
                    connectOrCreate: {
                      where: { name: newProduct.category || "General" },
                      create: { name: newProduct.category || "General" },
                    },
                  },
                },
              },
            },
          } as any,
        });
        return {
          ...created,
          price: Number(created.price),
          discountPrice: created.discountPrice
            ? Number(created.discountPrice)
            : undefined,
        } as Product;
      } catch (err) {
        console.error(
          "No se pudo guardar la creación en Prisma, guardando en Mock en memoria",
          err,
        );
      }
    }

    products.push(newProduct);
    return newProduct;
  }

  async update(
    id: string,
    updates: Partial<Product>,
  ): Promise<Product | undefined> {
    if (!useMock) {
      const prisma = getPrisma();
      try {
        const updated: any = await prisma.product.update({
          where: { id },
          data: updates as any,
        });
        return {
          ...updated,
          price: Number(updated.price),
          discountPrice: updated.discountPrice
            ? Number(updated.discountPrice)
            : undefined,
        } as Product;
      } catch (err) {
        console.error(
          "No se pudo actualizar con Prisma, actualizando en Mock",
          err,
        );
      }
    }

    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      return products[index];
    }
    return undefined;
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    await this.update(id, { stock: newStock });
  }
}

export const productRepository = new ProductRepository();
