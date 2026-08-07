import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productService, CreateProductPayload } from "../services/productService.ts";
import { adminService } from "../services/adminService.ts";

export type AdminTab =
  | "inventory"
  | "payments"
  | "audit"
  | "sales"
  | "settlements"
  | "staff";

export const useAdminDashboard = () => {
  const queryClient = useQueryClient();

  // Pestañas de navegación
  const [activeTab, setActiveTab] = useState<AdminTab>("inventory");

  // Estado de los modales de administración
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Consultas ligeras solo para estadísticas del encabezado (limit=1)
  const { data: productsData } = useQuery({
    queryKey: ["admin-products", { page: 1, limit: 1 }],
    queryFn: () =>
      productService.getProducts({ includeInactive: true, page: 1, limit: 1 }),
  });

  const { data: auditLogsData } = useQuery({
    queryKey: ["admin-audit-logs", { page: 1, limit: 1 }],
    queryFn: () => adminService.getAuditLogs({ page: 1, limit: 1 }),
  });

  // Invalidación / refresco de caché global
  const refreshData = () => {
    queryClient.invalidateQueries();
  };

  // Handler para la creación de un nuevo producto
  const handleCreateProduct = async (
    productPayload: CreateProductPayload | FormData
  ) => {
    await productService.createProduct(productPayload);
    refreshData();
  };

  return {
    // Estados
    activeTab,
    showCreateModal,
    showCategoryModal,

    // Datos calculados/consultados
    productsCount: productsData?.total || 0,
    auditLogsCount: auditLogsData?.total || 0,
    pendingPaymentsCount: 0,

    // Acciones de pestañas y modales
    setActiveTab,
    openCreateModal: () => setShowCreateModal(true),
    closeCreateModal: () => setShowCreateModal(false),
    openCategoryModal: () => setShowCategoryModal(true),
    closeCategoryModal: () => setShowCategoryModal(false),

    // Acciones de datos
    refreshData,
    handleCreateProduct,
  };
};
