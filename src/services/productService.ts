/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from "./apiClient.ts";
import { Product } from "../types/index.ts";

export interface GetProductsParams {
  includeInactive?: boolean;
  subcategoryId?: string;
  search?: string;
}

export const productService = {
  getProducts: async (params: GetProductsParams = {}): Promise<Product[]> => {
    const queryParams = new URLSearchParams();

    if (params.includeInactive) queryParams.append("includeInactive", "true");
    if (params.subcategoryId)
      queryParams.append("subcategoryId", params.subcategoryId);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<Product[]>(endpoint);
  },

  getProductById: async (id: string): Promise<Product> => {
    return apiClient.get<Product>(`/api/products/${id}`);
  },

  getProductByBarcode: async (barcode: string): Promise<Product> => {
    return apiClient.get<Product>(`/api/products/barcode/${barcode}`);
  },

  createProduct: async (
    formData: FormData,
    userId = "admin-dashboard",
  ): Promise<Product> => {
    return apiClient.post<Product>("/api/products", formData, {
      headers: { "x-user-id": userId },
    });
  },

  updateProduct: async (
    id: string,
    formData: FormData,
    userId = "admin-dashboard",
  ): Promise<Product> => {
    return apiClient.patch<Product>(`/api/products/${id}`, formData, {
      headers: { "x-user-id": userId },
    });
  },

  /**
   * Actualiza el estado de activación de un producto.
   * @param id - El ID del producto.
   * @param isActive - El nuevo estado de activación.
   * @param userId - ID del usuario que realiza la acción para propósitos de auditoría.
   */
  updateProductActivity: async (
    id: string,
    isActive: boolean,
    userId = "admin-dashboard",
  ): Promise<Product> => {
    const formData = new FormData();
    formData.append("isActive", String(isActive));

    return apiClient.patch<Product>(`/api/products/${id}`, formData, {
      headers: { "x-user-id": userId },
    });
  },
};
