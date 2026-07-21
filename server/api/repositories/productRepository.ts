import { getPrisma } from "../db.ts";
import type { CreateProductInput } from "../schemas/productSchema.ts";
import { Prisma } from "../../../generated/prisma/client.ts";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    subcategory: {
      include: {
        category: true;
      };
    };
  };
}>;

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  subcategoryId?: string;
  categoryId?: string;
  search?: string;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "name_asc";
  isRecommended?: boolean;
  hasDiscount?: boolean;
  includeInactive?: boolean;
}

export class ProductRepository {
  /**
   * Obtiene los productos desde la BD con sus relaciones puras de Prisma.
   */
  private prisma = getPrisma();

  async getAll(includeInactive = false): Promise<ProductWithRelations[]> {
    return await this.prisma.product.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        images: true,
        subcategory: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPaginated(options: ProductQueryOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 12);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(options.includeInactive ? {} : { isActive: true }),
      ...(options.subcategoryId ? { subcategoryId: options.subcategoryId } : {}),
      ...(options.categoryId ? { subcategory: { categoryId: options.categoryId } } : {}),
      ...(options.isRecommended ? { isRecommended: true } : {}),
      ...(options.hasDiscount ? { discountPrice: { not: null } } : {}),
    };

    if (options.search && options.search.trim()) {
      const query = options.search.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
        { barcode: { contains: query } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (options.sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (options.sortBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (options.sortBy === "name_asc") {
      orderBy = { name: "asc" };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          images: true,
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Busca un producto por ID único devolviendo el tipo relacional de Prisma o null.
   */
  async getById(id: string): Promise<ProductWithRelations | null> {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Inserta un producto real y su imagen inicial utilizando la infraestructura de Prisma.
   */
  async create(
    input: CreateProductInput,
    imageUrl: string,
  ): Promise<ProductWithRelations> {
    return await this.prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        price: new Prisma.Decimal(input.price),
        discountPrice: input.discountPrice
          ? new Prisma.Decimal(input.discountPrice)
          : null,
        stock: input.stock,
        brand: input.brand || null,
        unit: input.unit,
        isRecommended: input.isRecommended,
        isActive: input.isActive,
        subcategoryId: input.subcategoryId,
        barcode: input.barcode || null,
        specifications: input.specifications as Prisma.InputJsonValue,

        images: {
          create: [
            {
              url: imageUrl,
              order: 1,
            },
          ],
        },
      },
      include: {
        images: true,
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Actualiza los datos crudos en PostgreSQL.
   */
  async update(
    id: string,
    input: Partial<CreateProductInput>,
  ): Promise<ProductWithRelations> {
    return await this.prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        price: input.price ? new Prisma.Decimal(input.price) : undefined,
        discountPrice: input.discountPrice
          ? new Prisma.Decimal(input.discountPrice)
          : undefined,
        stock: input.stock,
        brand: input.brand,
        unit: input.unit,
        isRecommended: input.isRecommended,
        isActive: input.isActive,
        subcategoryId: input.subcategoryId,
        barcode: input.barcode,
        specifications:
          input.specifications !== undefined
            ? (input.specifications as Prisma.InputJsonValue)
            : undefined,
      },
      include: {
        images: true,
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Modifica exclusivamente el stock de un producto.
   */
  async updateStock(id: string, newStock: number): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });
  }

  /**
   * Aplica un borrado lógico (Soft Delete) cambiando el flag de estado.
   */
  async softDelete(id: string): Promise<ProductWithRelations> {
    const prisma = getPrisma();
    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: {
        images: true,
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async getByIds(ids: string[], includeInactive = false) {
    const prisma = getPrisma(); // Alineado con tu inicializador

    return await prisma.product.findMany({
      where: {
        id: { in: ids },
        ...(includeInactive ? {} : { isActive: true }), // Respeta tu flag de borrado lógico
      },
    });
  }

  /**
   * Busca un producto específicamente por su código de barras (Lector industrial).
   */
  async getByBarcode(barcode: string): Promise<ProductWithRelations | null> {
    return await this.prisma.product.findUnique({
      where: { barcode },
      include: {
        images: true,
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });
  }
}

export const productRepository = new ProductRepository();
