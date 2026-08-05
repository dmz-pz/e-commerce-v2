/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './apiClient.ts';
import { Payment, AuditLog, User } from '../types/index.ts';

// Re-utilizamos la misma estructura del backend para asegurar consistencia
export interface CreateStaffPayload {
  cedula: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password?: string;
  role: string;
}

export interface DriverCashDTO {
  id: string;
  name: string;
  status: string;
  cashInHand: number;
}

export interface SettlementDTO {
  id: string;
  driverName: string;
  reviewedByName: string;
  createdAt: string;
  amount: number;
}

export const adminService = {
  /**
   * Obtiene la lista de todos los depósitos / pagos registrados en el sistema.
   */
  getPayments: async (params?: { page?: number; limit?: number }): Promise<import('../types/index.ts').PaginatedResponse<Payment>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    const queryString = queryParams.toString();
    
    const res = await apiClient.get<import('../types/index.ts').PaginatedResponse<Payment> | Payment[]>(`/api/admin/payments${queryString ? `?${queryString}` : ''}`);
    if (Array.isArray(res)) {
      return { items: res, total: res.length, page: 1, limit: res.length || 10, totalPages: 1 };
    }
    return res;
  },

  /**
   * Obtiene el historial de registros de auditoría (logs) de todas las operaciones administrativas.
   */
  getAuditLogs: async (params?: { page?: number; limit?: number }): Promise<import('../types/index.ts').PaginatedResponse<AuditLog>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    const queryString = queryParams.toString();

    const res = await apiClient.get<import('../types/index.ts').PaginatedResponse<AuditLog> | AuditLog[]>(`/api/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
    if (Array.isArray(res)) {
      return { items: res, total: res.length, page: 1, limit: res.length || 10, totalPages: 1 };
    }
    return res;
  },

  /**
   * Aprueba o rechaza el pago de un pedido por depósito/transferencia.
   * @param paymentId - El ID del registro de pago de depósito.
   * @param status - El veredicto ('APPROVED' o 'REJECTED').
   * @param userId - ID del usuario administrador que realiza la auditoría.
   */
  reviewPayment: async (paymentId: string, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    return apiClient.patch<void>(`/api/admin/payments/${paymentId}`, { status });
  },

  // ==========================================
  // MÉTODOS DE LIQUIDACIÓN DE MOTORIZADOS
  // ==========================================
  
  getDriversCash: async (): Promise<DriverCashDTO[]> => {
    return apiClient.get<DriverCashDTO[]>('/api/admin/drivers/cash');
  },

  getSettlements: async (): Promise<SettlementDTO[]> => {
    return apiClient.get<SettlementDTO[]>('/api/admin/settlements');
  },

  settleCash: async (driverId: string): Promise<unknown> => {
    return apiClient.post<unknown>(`/api/admin/drivers/${driverId}/settle`, {});
  },

  // ==========================================
  // MÉTODOS DE GESTIÓN DE PERSONAL (STAFF)
  // ==========================================
  
  getUsers: async (role?: string): Promise<User[]> => {
    const url = role ? `/api/admin/users?role=${role}` : '/api/admin/users';
    return apiClient.get<User[]>(url);
  },

  createStaff: async (userData: CreateStaffPayload): Promise<User> => {
    return apiClient.post<User>('/api/admin/users', userData);
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    return apiClient.patch<User>(`/api/admin/users/${userId}/role`, { role });
  },

  deleteUser: async (userId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/admin/users/${userId}`);
  }
};
