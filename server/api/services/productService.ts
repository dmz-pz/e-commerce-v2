import { productRepository } from "../repositories/productRepository.ts";
import type { ProductWithRelations } from "../repositories/productRepository.ts";
import type { CreateProductInput } from "../schemas/productSchema.ts";
import { auditLogRepository } from "../repositories/auditLogRepository.ts";

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
  async getProductByBarcode(
    barcode: string,
  ): Promise<ProductWithRelations | null> {
    return await productRepository.getByBarcode(barcode);
  }

  /**
   * Coordina la creación de un producto junto con su imagen inicial y el log de auditoría.
   */
  async createProduct(
    input: CreateProductInput,
    imageUrl: string,
    performedByUserId: string,
  ): Promise<ProductWithRelations> {
    // Regla de negocio: Validación de consistencia lógica entre precio y descuento
    if (
      input.discountPrice &&
      Number(input.discountPrice) >= Number(input.price)
    ) {
      throw new Error(
        "El precio de descuento no puede ser mayor o igual al precio original del producto",
      );
    }

    console.log(performedByUserId);
    // Persistencia atómica en la base de datos a través del repositorio
    const product = await productRepository.create(input, imageUrl);

    // Registro de la acción en la bitácora de auditoría
    await auditLogRepository.create({
      action: `Creación de producto: ${product.name}`,
      performedById: performedByUserId,
      newState: product,
    });

    return product;
  }

  /**
   * Actualiza las propiedades de un producto existente y registra los cambios de estado.
   */
  async updateProduct(
    barcode: string,
    updates: Partial<CreateProductInput>,
    performedByUserId: string,
  ): Promise<ProductWithRelations> {
    const previousState = await productRepository.getByBarcode(barcode);
    if (!previousState) {
      throw new Error(
        `No se puede actualizar: El producto con codigo de barra ${barcode} no existe`,
      );
    }

    // Regla de negocio: Validar precios combinando los cambios nuevos con el estado previo
    const finalPrice = updates.price ?? Number(previousState.price);
    const finalDiscount =
      updates.discountPrice !== undefined
        ? updates.discountPrice
        : previousState.discountPrice;

    if (finalDiscount && Number(finalDiscount) >= Number(finalPrice)) {
      throw new Error(
        "El precio de descuento no puede ser mayor o igual al precio original del producto",
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
