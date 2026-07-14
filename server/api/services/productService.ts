import { productRepository } from "../repositories/productRepository.ts";
import type { ProductWithRelations } from "../repositories/productRepository.ts";
import type { CreateProductInput } from "../schemas/productSchema.ts";
import { auditLogRepository } from "../repositories/auditLogRepository.ts";
import { AppError } from "../utils/appErrors.ts";

export class ProductService {
  /**
   * Obtiene todos los productos del catálogo.
   * @param includeInactive Booleano para incluir o no productos desactivados.
   */
  async getAllProducts(
    includeInactive = false,
  ): Promise<ProductWithRelations[]> {
    return await productRepository.getAll(includeInactive);
  }

  /**
   * Busca un producto específico por su ID único.
   * Devuelve el objeto con sus relaciones o null si no es encontrado.
   */
  async getProductByBarcode(barcode: string): Promise<ProductWithRelations> {
    const product = await productRepository.getByBarcode(barcode);
    if (!product) {
      throw new AppError(
        `El producto con el codigo de barras ${barcode} no existe`,
        404,
      );
    }
    return product;
  }

  /**
   * Coordina la creación de un producto junto con su imagen inicial y el log de auditoría.
   */
  async createProduct(
    input: CreateProductInput,
    imageUrl: string,
    performedByUserId: string,
  ): Promise<ProductWithRelations> {
    if (
      input.discountPrice &&
      Number(input.discountPrice) >= Number(input.price)
    ) {
      throw new AppError(
        "El precio de descuento no puede ser mayor o igual al precio original del producto",
        400,
      );
    }
    try {
      if (!input.barcode) {
        throw new AppError(
          "El código de barras es requerido para registrar el producto",
          400,
        );
      }

      const existingProduct = await productRepository.getByBarcode(
        input.barcode,
      );
      if (existingProduct) {
        throw new AppError(
          `Conflict: Ya existe un producto registrado con el código de barras '${input.barcode}'`,
          409,
        );
      }
      const product = await productRepository.create(input, imageUrl);

      await auditLogRepository.create({
        action: `Creación de producto: ${product.name}`,
        performedById: performedByUserId,
        newState: product,
      });

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Actualiza las propiedades de un producto existente y registra los cambios de estado.
   */
  async updateProduct(
    barcode: string,
    updates: Partial<CreateProductInput>,
    performedByUserId: string,
  ): Promise<ProductWithRelations> {
    const previousState = await this.getProductByBarcode(barcode);

    // Regla de negocio: Validar precios combinando los cambios nuevos con el estado previo
    const finalPrice = updates.price ?? Number(previousState.price);
    const finalDiscount =
      updates.discountPrice !== undefined
        ? updates.discountPrice
        : previousState.discountPrice;

    if (finalDiscount && Number(finalDiscount) >= Number(finalPrice)) {
      throw new AppError(
        "El precio de descuento no puede ser mayor o igual al precio original del producto",
        400,
      );
    }

    // Ejecución de la actualización en la base de datos
    const updated = await productRepository.update(barcode, updates);

    // Determinamos el nombre de la acción basándonos en el cambio de visibilidad
    let actionName = `Actualización de producto: ${updated.name}`;
    if (
      updates.isActive !== undefined &&
      previousState.isActive !== updates.isActive
    ) {
      actionName = updates.isActive
        ? `Activación de visibilidad de producto: ${updated.name}`
        : `Desactivación de visibilidad de producto: ${updated.name}`;
    }

    // Registro de auditoría guardando el estado anterior e histórico nuevo
    await auditLogRepository.create({
      action: actionName,
      performedById: performedByUserId,
      previousState,
      newState: updated,
    });

    return updated;
  }

  /**
   * Verifica la disponibilidad de inventario y disminuye el stock si es suficiente.
   */
  async validateAndReserveStock(
    barcode: string,
    quantity: number,
  ): Promise<boolean> {
    const product = await productRepository.getByBarcode(barcode);

    // Si el producto no existe o el stock actual es menor a lo solicitado, deniega la reserva
    if (!product || product.stock < quantity) {
      return false;
    }

    // Actualiza disminuyendo la cantidad solicitada
    await productRepository.updateStock(barcode, product.stock - quantity);
    return true;
  }

  /**
   * Restaura o incrementa el inventario de un producto (ej. en caso de devoluciones o cancelaciones).
   */
  async restoreStock(barcode: string, quantity: number): Promise<void> {
    const product = await productRepository.getByBarcode(barcode);
    if (product) {
      await productRepository.updateStock(barcode, product.stock + quantity);
    }
  }
}

export const productService = new ProductService();
