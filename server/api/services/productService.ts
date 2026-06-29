import { productRepository } from "../repositories/productRepository.ts";
import { Product } from "../../../src/types/index.ts";
import { auditLogRepository } from "../repositories/auditLogRepository.ts";

export class ProductService {
  async getAllProducts(includeInactive = false): Promise<Product[]> {
    return await productRepository.getAll(includeInactive);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return await productRepository.getById(id);
  }

  async createProduct(productData: Omit<Product, 'id'>, performedByUserId = "admin"): Promise<Product> {
    const product = await productRepository.create(productData);
    
    // Log action to audit trails
    await auditLogRepository.create({
      action: `Creación de producto: ${product.name}`,
      performedById: performedByUserId,
      performedByName: "Administrador",
      newState: product
    });

    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>, performedByUserId = "admin"): Promise<Product | undefined> {
    const previousState = await productRepository.getById(id);
    const updated = await productRepository.update(id, updates);

    if (updated) {
      // Log action to audit trails
      let actionName = `Actualización de producto: ${updated.name}`;
      if (updates.isActive !== undefined && previousState?.isActive !== updates.isActive) {
        actionName = updates.isActive 
          ? `Activación de visibilidad de producto: ${updated.name}` 
          : `Desactivación de visibilidad de producto: ${updated.name}`;
      }

      await auditLogRepository.create({
        action: actionName,
        performedById: performedByUserId,
        performedByName: "Administrador",
        previousState,
        newState: updated
      });
    }

    return updated;
  }

  async validateAndReserveStock(productId: string, quantity: number): Promise<boolean> {
    const product = await productRepository.getById(productId);
    if (!product || product.stock < quantity) {
      return false;
    }
    
    await productRepository.updateStock(productId, product.stock - quantity);
    return true;
  }

  async restoreStock(productId: string, quantity: number): Promise<void> {
    const product = await productRepository.getById(productId);
    if (product) {
      await productRepository.updateStock(productId, product.stock + quantity);
    }
  }
}

export const productService = new ProductService();
