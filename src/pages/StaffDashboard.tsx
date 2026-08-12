import React from 'react';
import { Package } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useStaffDashboard } from '../hooks/useStaffDashboard.ts';

// Componentes modulares de operaciones de personal (Staff/Pickers)
import { StaffHeader } from '../components/staff/StaffHeader.tsx';
import { OrderCard } from '../components/staff/OrderCard.tsx';
import { SubstitutionModal } from '../components/staff/SubstitutionModal.tsx';
import { CancelOrderModal } from '../components/staff/CancelOrderModal.tsx';
import { PaginationBar } from '../components/catalog/PaginationBar.tsx';
import { PaymentReferenceModal } from '../components/staff/PaymentReferenceModal.tsx';

export const StaffDashboard: React.FC = () => {
  const {
    loading,
    filter,
    setFilter,
    page,
    setPage,
    limit,
    setLimit,
    assigningId,
    setAssigningId,
    substitutingItem,
    setSubstitutingItem,
    addingToOrderId,
    setAddingToOrderId,
    validatingPaymentOrderId,
    setValidatingPaymentOrderId,
    cancelingOrder,
    setCancelingOrder,
    errorMessage,
    setErrorMessage,
    modifyingOrderId,
    availableMotorizados,
    dirtyOrders,
    paginatedOrders,
    filteredOrders,
    totalPages,
    handleUpdateItemQuantity,
    handleRemoveItem,
    handleConfirmCancelOrder,
    handlePerformSubstitution,
    handleAddProduct,
    handleSaveOrderItems,
    handleDiscardOrderChanges,
    handleUpdateStatus,
    handleConfirmPaymentAndFinish,
    handleAssignDelivery,
  } = useStaffDashboard();

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-brand animate-pulse">
        Iniciando terminal de personal operativo...
      </div>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Modular Header */}
        <StaffHeader filter={filter} setFilter={setFilter} />

        {/* Orders Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {paginatedOrders.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-inner">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 font-medium tracking-tight text-lg">
                  Cola vacía • Esperando nuevos pedidos
                </p>
              </div>
            ) : (
              paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  availableMotorizados={availableMotorizados}
                  modifyingOrderId={modifyingOrderId}
                  errorMessage={errorMessage}
                  assigningId={assigningId}
                  isDirty={!!dirtyOrders[order.id]}
                  setAssigningId={setAssigningId}
                  onUpdateStatus={handleUpdateStatus}
                  onAssignDelivery={handleAssignDelivery}
                  onUpdateItemQuantity={handleUpdateItemQuantity}
                  onRemoveItem={handleRemoveItem}
                  onSaveOrderItems={handleSaveOrderItems}
                  onDiscardOrderChanges={handleDiscardOrderChanges}
                  onSetSubstitutingItem={setSubstitutingItem}
                  onAddProduct={() => setAddingToOrderId(order.id)}
                  onRequirePaymentReference={() => setValidatingPaymentOrderId(order.id)}
                  onOpenCancelModal={(id, customerName) => setCancelingOrder({ id, customerName })}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Barra de Paginación Inferior */}
        {filteredOrders.length > 0 && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalProducts={filteredOrders.length}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            entityName="pedidos"
            limitOptions={[6, 12, 24, 48]}
          />
        )}
      </div>

      {/* Modular Substitution Popup Overlay */}
      <SubstitutionModal
        substitutingItem={substitutingItem}
        onClose={() => setSubstitutingItem(null)}
        onPerformSubstitution={handlePerformSubstitution}
        errorMessage={errorMessage}
      />

      {/* Add New Product Popup Overlay (Reusing SubstitutionModal UI) */}
      <SubstitutionModal
        substitutingItem={addingToOrderId ? { orderId: addingToOrderId, productId: '', name: 'NUEVO PRODUCTO' } : null}
        onClose={() => setAddingToOrderId(null)}
        onPerformSubstitution={(replacement) => handleAddProduct(replacement)}
        errorMessage={errorMessage}
        isAddMode={true}
      />

      {/* Modular Cancel Order Popup Overlay */}
      <CancelOrderModal
        cancelingOrder={cancelingOrder}
        onClose={() => { setCancelingOrder(null); setErrorMessage(null); }}
        onConfirmCancel={handleConfirmCancelOrder}
        errorMessage={errorMessage}
      />

      {/* Payment Reference Validation Modal */}
      <PaymentReferenceModal
        orderData={validatingPaymentOrderId 
          ? { 
              id: validatingPaymentOrderId, 
              total: Number(filteredOrders.find((o) => o.id === validatingPaymentOrderId)?.total || 0),
              customerName: filteredOrders.find((o) => o.id === validatingPaymentOrderId)?.customerName || 'Cliente'
            } 
          : null}
        onClose={() => setValidatingPaymentOrderId(null)}
        onSubmit={(ref, file) => handleConfirmPaymentAndFinish(validatingPaymentOrderId!, ref, file)}
      />
    </main>
  );
};
