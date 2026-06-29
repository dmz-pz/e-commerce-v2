import React, { useState, useEffect } from 'react';
import { Product, Payment, AuditLog, Order, OrderStatus } from '../types/index.ts';
import { 
  Package, Plus, Coins, RefreshCw, ClipboardList, TrendingUp 
} from 'lucide-react';
import { Logo } from '../components/Logo.tsx';
import { productService } from '../services/productService.ts';
import { adminService } from '../services/adminService.ts';
import { orderService } from '../services/orderService.ts';

// Componentes modulares refinados
import { AdminStats } from '../components/admin/AdminStats.tsx';
import { InventoryTab } from '../components/admin/InventoryTab.tsx';
import { SalesTab } from '../components/admin/SalesTab.tsx';
import { PaymentsTab } from '../components/admin/PaymentsTab.tsx';
import { AuditLogsTab } from '../components/admin/AuditLogsTab.tsx';
import { ProductCreateModal } from '../components/admin/ProductCreateModal.tsx';

export const AdminDashboard: React.FC = () => {
  // Pestañas de navegación
  const [activeTab, setActiveTab] = useState<'inventory' | 'payments' | 'audit' | 'sales'>('inventory');

  // Estados generales de datos
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Estado del modal de cargas
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Consultores de servicios en API / Mock
  const fetchInventory = async () => {
    try {
      const data = await productService.getProducts(true);
      setProducts(data);
    } catch (err) {
      console.error("Error al obtener catálogo administrador:", err);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await adminService.getPayments();
      setPayments(data);
    } catch (err) {
      console.error("Error al obtener auditoría de transacciones:", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const data = await adminService.getAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      console.error("Error al obtener logs de trazabilidad:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Error al obtener órdenes totales en administración:", err);
    }
  };

  const loadAllData = () => {
    fetchInventory();
    fetchPayments();
    fetchAuditLogs();
    fetchOrders();
  };

  // Inicialización y Polling cada 15s para real-time updates
  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAllData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Set active visibility toggler
  const toggleProductActive = async (id: string, currentStatus: boolean) => {
    try {
      await productService.updateProductActivity(id, !currentStatus, 'admin-dashboard');
      fetchInventory();
      fetchAuditLogs();
    } catch (e) {
      console.error("Error al cambiar visibilidad del producto", e);
    }
  };

  // Create product submission
  const handleCreateProductSubmit = async (productPayload: any) => {
    await productService.createProduct(productPayload, 'admin-dashboard');
    fetchInventory();
    fetchAuditLogs();
  };

  // Review deposit/payment
  const handlePaymentReview = async (paymentId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminService.reviewPayment(paymentId, status, 'admin-dashboard');
      fetchPayments();
      fetchAuditLogs();
    } catch (err) {
      console.error("Error al auditar estado de pago", err);
    }
  };

  // Update order status with logging update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await orderService.updateOrderStatus(orderId, status);
    fetchOrders();
    fetchInventory(); // To re-verify stock in case of cancellations
    fetchAuditLogs();
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        
        {/* Modern Admin Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-10 gap-6 border-b border-slate-200/60 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 text-brand font-mono text-[10px] font-black uppercase tracking-[0.3em]">
              <Logo className="w-8 h-8" />
              Sede Administrativa
            </div>
            <h1 className="text-3xl font-light text-slate-900 tracking-tight">Panel de <span className="font-bold text-brand">Administración General</span></h1>
            <p className="text-slate-400 text-sm mt-1">Monitorea y regula inventario, activos financieros y pistas de auditoría</p>
          </div>

          {/* Quick Stats Grid */}
          <AdminStats 
            productsCount={products.length}
            pendingPaymentsCount={payments.filter(p => p.status === 'PENDING').length}
            auditLogsCount={auditLogs.length}
          />
        </header>

        {/* Section Navigation Tabs & Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto max-w-full no-scrollbar whitespace-nowrap shrink-0 self-start gap-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'inventory' 
                  ? 'bg-brand text-white shadow-md shadow-brand/10' 
                  : 'text-slate-500 hover:text-brand hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Inventario de Productos
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'sales' 
                  ? 'bg-brand text-white shadow-md shadow-brand/10' 
                  : 'text-slate-500 hover:text-brand hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Ventas y Pedidos
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'payments' 
                  ? 'bg-brand text-white shadow-md shadow-brand/10' 
                  : 'text-slate-500 hover:text-brand hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4" />
              Auditar Transacciones
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'audit' 
                  ? 'bg-brand text-white shadow-md shadow-brand/10' 
                  : 'text-slate-500 hover:text-brand hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Trazabilidad (Logs)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadAllData}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-400 hover:text-brand cursor-pointer"
              title="Refrescar Datos"
            >
              <RefreshCw className="w-4 h-4 animate-hover" />
            </button>

            {activeTab === 'inventory' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-brand text-white text-[11px] font-black uppercase tracking-widest px-6 h-12 rounded-xl hover:bg-brand-dark transition-all shadow-md shadow-brand/15 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Cargar Producto
              </button>
            )}
          </div>
        </div>

        {/* --- RENDERED TAB CONTENTS --- */}
        {activeTab === 'inventory' && (
          <InventoryTab 
            products={products}
            onToggleProductActive={toggleProductActive}
          />
        )}

        {activeTab === 'sales' && (
          <SalesTab 
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRefreshLogs={fetchAuditLogs}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab 
            payments={payments}
            onReviewPayment={handlePaymentReview}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogsTab 
            auditLogs={auditLogs}
          />
        )}

        {/* --- LOAD NEW PRODUCT POPUP MODAL --- */}
        <ProductCreateModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProductSubmit}
        />

      </div>
    </main>
  );
};
