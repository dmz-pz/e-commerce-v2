import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Unused OrderStatus removed
import {
  Package,
  Coins,
  RefreshCw,
  ClipboardList,
  TrendingUp,
  Wallet,
  Users,
} from "lucide-react";
import { Logo } from "../components/Logo.tsx";
import { productService } from "../services/productService.ts";
import { adminService } from "../services/adminService.ts";
// Unused orderService removed

// Componentes modulares refinados
import { AdminStats } from "../components/admin/AdminStats.tsx";
import { InventoryTab } from "../components/admin/InventoryTab.tsx";
import { SalesTab } from "../components/admin/SalesTab.tsx";
import { PaymentsTab } from "../components/admin/PaymentsTab.tsx";
import { AuditLogsTab } from "../components/admin/AuditLogsTab.tsx";
import { ProductCreateModal } from "../components/admin/ProductCreateModal.tsx";
import { CategoryManageModal } from "../components/admin/CategoryManageModal.tsx";
import { SettlementsTab } from "../components/admin/SettlementsTab.tsx";
import { StaffTab } from "../components/admin/StaffTab.tsx";

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // Pestañas de navegación
  const [activeTab, setActiveTab] = useState<
    "inventory" | "payments" | "audit" | "sales" | "settlements" | "staff"
  >("inventory");

  // Estado del modal de cargas
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Consultas ligeras solo para estadísticas del encabezado (limit=1)
  const { data: productsData } = useQuery({
    queryKey: ["admin-products", { page: 1, limit: 1 }],
    queryFn: () => productService.getProducts({ includeInactive: true, page: 1, limit: 1 }),
  });

  // Removed unused paymentsData query

  const { data: auditLogsData } = useQuery({
    queryKey: ["admin-audit-logs", { page: 1, limit: 1 }],
    queryFn: () => adminService.getAuditLogs({ page: 1, limit: 1 }),
  });

  const loadAllData = () => {
    queryClient.invalidateQueries();
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-10 gap-6 border-b border-slate-200/60 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 text-brand font-mono text-[10px] font-black uppercase tracking-[0.3em]">
              <Logo className="w-8 h-8" />
              Sede Administrativa
            </div>
            <h1 className="text-3xl font-light text-slate-900 tracking-tight">
              Panel de{" "}
              <span className="font-bold text-brand">
                Administración General
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Monitorea y regula inventario, activos financieros y pistas de
              auditoría
            </p>
          </div>

          <AdminStats
            productsCount={productsData?.total || 0}
            pendingPaymentsCount={0}
            auditLogsCount={auditLogsData?.total || 0}
          />
        </header>

        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto max-w-full no-scrollbar whitespace-nowrap shrink-0 self-start gap-1">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "inventory"
                  ? "bg-brand text-white shadow-md shadow-brand/10"
                  : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <Package className="w-4 h-4" />
              Inventario de Productos
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "sales"
                  ? "bg-brand text-white shadow-md shadow-brand/10"
                  : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Ventas y Pedidos
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "payments"
                  ? "bg-brand text-white shadow-md shadow-brand/10"
                  : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <Coins className="w-4 h-4" />
              Auditar Transacciones
            </button>
            <button
              onClick={() => setActiveTab("settlements")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "settlements"
                  ? "bg-brand text-white shadow-md shadow-brand/10"
                  : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <Wallet className="w-4 h-4" />
              Tesorería (Efectivo)
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "audit"
                  ? "bg-brand text-white shadow-md shadow-brand/10"
                  : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <ClipboardList className="w-4 h-4" />
              Trazabilidad (Logs)
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "staff"
                  ? "bg-brand text-white shadow-md shadow-brand/10"
                  : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <Users className="w-4 h-4" />
              Gestión de Personal
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-400 hover:text-brand cursor-pointer self-start md:self-auto"
              title="Refrescar Datos"
            >
              <RefreshCw className="w-4 h-4 animate-hover" />
            </button>
          </div>
        </div>

        {activeTab === "inventory" && (
          <InventoryTab
            onCreateProduct={() => setShowCreateModal(true)}
            onManageCategories={() => setShowCategoryModal(true)}
          />
        )}

        {activeTab === "sales" && (
          <SalesTab />
        )}

        {activeTab === "settlements" && (
          <SettlementsTab />
        )}

        {activeTab === "payments" && (
          <PaymentsTab />
        )}

        {activeTab === "audit" && <AuditLogsTab />}
        {activeTab === "staff" && <StaffTab />}

        <ProductCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (productPayload) => {
            await productService.createProduct(productPayload);
            loadAllData();
          }}
        />

        <CategoryManageModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSuccess={loadAllData}
        />
      </div>
    </main>
  );
};
