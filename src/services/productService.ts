/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from "./apiClient.ts";
import { Product } from "../types/index.ts";

export interface PaginatedProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetProductsParams {
  includeInactive?: boolean;
  subcategoryId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "name_asc";
  isRecommended?: boolean;
  hasDiscount?: boolean;
  all?: boolean;
}

export const productService = {
  getProducts: async (params: GetProductsParams = {}): Promise<PaginatedProductsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.includeInactive) queryParams.append("includeInactive", "true");
    if (params.subcategoryId) queryParams.append("subcategoryId", params.subcategoryId);
    if (params.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", String(params.page));
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.isRecommended) queryParams.append("isRecommended", "true");
    if (params.hasDiscount) queryParams.append("hasDiscount", "true");
    if (params.all) queryParams.append("all", "true");

    const queryString = queryParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;

    const res = await apiClient.get<PaginatedProductsResponse | Product[]>(endpoint);
    if (Array.isArray(res)) {
      return {
        items: res,
        total: res.length,
        page: 1,
        limit: res.length || 12,
        totalPages: 1,
      };
    }
    return res;
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
