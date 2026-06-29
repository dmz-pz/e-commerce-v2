/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './apiClient.ts';
import { Product } from '../types/index.ts';

export const productService = {
  /**
   * Obtiene la lista de productos del catálogo.
   * @param includeInactive - Si es verdadero, incluye los productos inactivos (para administradores).
   */
  getProducts: async (includeInactive = false): Promise<Product[]> => {
    const endpoint = includeInactive ? '/api/products?includeInactive=true' : '/api/products';
    return apiClient.get<Product[]>(endpoint);
  },

  /**
   * Crea un nuevo producto en el catálogo.
   * @param productData - Los datos del nuevo producto sin el ID.
   * @param userId - ID del usuario que realiza la acción para propósitos de auditoría.
   */
  createProduct: async (productData: Omit<Product, 'id'>, userId = 'admin-dashboard'): Promise<Product> => {
    return apiClient.post<Product>('/api/products', productData, {
      headers: { 'x-user-id': userId }
    });
  },

  /**
   * Actualiza el estado de activación de un producto.
   * @param id - El ID del producto.
   * @param isActive - El nuevo estado de activación.
   * @param userId - ID del usuario que realiza la acción para propósitos de auditoría.
   */
  updateProductActivity: async (id: string, isActive: boolean, userId = 'admin-dashboard'): Promise<void> => {
    return apiClient.patch<void>(`/api/products/${id}`, { isActive }, {
      headers: { 'x-user-id': userId }
    });
  }
};
