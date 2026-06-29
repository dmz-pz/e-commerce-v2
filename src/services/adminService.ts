/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './apiClient.ts';
import { Payment, AuditLog } from '../types/index.ts';

export const adminService = {
  /**
   * Obtiene la lista de todos los depósitos / pagos registrados en el sistema.
   */
  getPayments: async (): Promise<Payment[]> => {
    return apiClient.get<Payment[]>('/api/admin/payments');
  },

  /**
   * Obtiene el historial de registros de auditoría (logs) de todas las operaciones administrativas.
   */
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return apiClient.get<AuditLog[]>('/api/admin/audit-logs');
  },

  /**
   * Aprueba o rechaza el pago de un pedido por depósito/transferencia.
   * @param paymentId - El ID del registro de pago de depósito.
   * @param status - El veredicto ('APPROVED' o 'REJECTED').
   * @param userId - ID del usuario administrador que realiza la auditoría.
   */
  reviewPayment: async (paymentId: string, status: 'APPROVED' | 'REJECTED', userId = 'admin-dashboard'): Promise<void> => {
    return apiClient.patch<void>(`/api/admin/payments/${paymentId}`, { status }, {
      headers: { 'x-user-id': userId }
    });
  }
};
