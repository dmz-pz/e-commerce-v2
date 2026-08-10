import React from "react";
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
import { useAdminDashboard } from "../hooks/useAdminDashboard.ts";

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
import { AdminBottomNav } from "../components/admin/AdminBottomNav.tsx";

export const AdminDashboard: React.FC = () => {
  const {
    activeTab,
    showCreateModal,
    showCategoryModal,
    productsCount,
    auditLogsCount,
    pendingPaymentsCount,
    setActiveTab,
    openCreateModal,
    closeCreateModal,
    openCategoryModal,
    closeCategoryModal,
    refreshData,
    handleCreateProduct,
  } = useAdminDashboard();

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
            productsCount={productsCount}
            pendingPaymentsCount={pendingPaymentsCount}
            auditLogsCount={auditLogsCount}
          />
        </header>

        <div className="hidden md:flex flex-row justify-between items-center gap-2 md:gap-4 mb-6 md:mb-8 w-full">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar whitespace-nowrap gap-1 w-full md:w-auto flex-1">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "inventory"
                ? "bg-brand text-white shadow-md shadow-brand/10"
                : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <Package className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              Inventario de Productos
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "sales"
                ? "bg-brand text-white shadow-md shadow-brand/10"
                : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              Ventas y Pedidos
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "payments"
                ? "bg-brand text-white shadow-md shadow-brand/10"
                : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <Coins className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              Auditar Transacciones
            </button>
            <button
              onClick={() => setActiveTab("settlements")}
              className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "settlements"
                ? "bg-brand text-white shadow-md shadow-brand/10"
                : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              Tesorería (Efectivo)
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "audit"
                ? "bg-brand text-white shadow-md shadow-brand/10"
                : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <ClipboardList className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              Trazabilidad (Logs)
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "staff"
                ? "bg-brand text-white shadow-md shadow-brand/10"
                : "text-slate-500 hover:text-brand hover:bg-slate-50"
                }`}
            >
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              Gestión de Personal
            </button>
          </div>

          <button
            onClick={refreshData}
            className="shrink-0 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-400 hover:text-brand cursor-pointer"
            title="Refrescar Datos"
          >
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-hover" />
          </button>
        </div>

        {activeTab === "inventory" && (
          <InventoryTab
            onCreateProduct={openCreateModal}
            onManageCategories={openCategoryModal}
            onRefresh={refreshData}
          />
        )}

        {activeTab === "sales" && <SalesTab />}

        {activeTab === "settlements" && <SettlementsTab />}

        {activeTab === "payments" && <PaymentsTab />}

        {activeTab === "audit" && <AuditLogsTab />}
        {activeTab === "staff" && <StaffTab />}

        <ProductCreateModal
          isOpen={showCreateModal}
          onClose={closeCreateModal}
          onSubmit={handleCreateProduct}
        />

        <CategoryManageModal
          isOpen={showCategoryModal}
          onClose={closeCategoryModal}
          onSuccess={refreshData}
        />
      </div>
      
      <AdminBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
};
