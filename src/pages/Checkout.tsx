import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';
import { useUser } from '../context/UserContext.tsx';
import { apiClient } from '../services/apiClient.ts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ShoppingBasket, Trash2, MapPin, Truck, Store, 
  CreditCard, Banknote, Smartphone, Receipt, ChevronRight, CheckCircle2
} from 'lucide-react';
import { OrderSuccessModal } from '../components/checkout/OrderSuccessModal.tsx';

type Step = 1 | 2;
type DeliveryMethod = 'DELIVERY' | 'PICK_UP';
type PaymentMethod = 'PAGO_MOVIL' | 'ZELLE' | 'EFECTIVO_DELIVERY' | 'PUNTO_DELIVERY';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();

  // Estado del flujo
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Estado del formulario
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [paymentReference, setPaymentReference] = useState('');

  // Modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else if (user.addresses && user.addresses.length > 0) {
      const address = user.addresses[0] as any;
      setSelectedAddress(address.line1 || address.street || address.address || 'Mi Dirección');
    }
  }, [user, navigate]);

  // Totales
  const shippingCost = deliveryMethod === 'DELIVERY' ? 2.00 : 0; // Costo fijo de delivery demo
  const finalTotal = total + shippingCost;

  const handleNextStep = () => {
    if (deliveryMethod === 'DELIVERY' && !selectedAddress) {
      setError('Por favor ingresa o selecciona una dirección de entrega.');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      setError('Debes seleccionar un método de pago.');
      return;
    }

    if ((paymentMethod === 'PAGO_MOVIL' || paymentMethod === 'ZELLE') && !paymentReference) {
      setError('Por favor ingresa el número de referencia del pago.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const orderPayload = {
        items: items.map(i => ({
          productId: i.productId,
          requestedQuantity: i.quantity
        })),
        fulfillmentMethod: deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? selectedAddress : undefined,
        paymentMethod,
        paymentReference: paymentReference || undefined
      };

      const response = (await apiClient.post('/api/orders', orderPayload)) as any;
      
      setGeneratedOrderId(response.id);
      clearCart();
      setShowSuccessModal(true);

    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Ocurrió un error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <ShoppingBasket className="w-24 h-24 text-slate-200 mb-6" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-slate-500 font-medium mb-8">Agrega productos del catálogo para continuar.</p>
        <Link to="/" className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Minimalista */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => currentStep === 2 ? setCurrentStep(1) : navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">
              {currentStep === 1 ? 'Revisión de Carrito' : 'Método de Pago'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-1 rounded-full ${currentStep >= 1 ? 'bg-brand' : 'bg-slate-200'}`} />
            <div className={`w-8 h-1 rounded-full ${currentStep >= 2 ? 'bg-brand' : 'bg-slate-200'}`} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Flujo */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {currentStep === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Opciones de Entrega */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
                    Método de Entrega
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setDeliveryMethod('DELIVERY')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                        deliveryMethod === 'DELIVERY' 
                          ? 'border-brand bg-brand/5' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <Truck className={`w-6 h-6 ${deliveryMethod === 'DELIVERY' ? 'text-brand' : 'text-slate-400'}`} />
                      <span className="font-bold text-slate-800">Envío a Domicilio</span>
                      <span className="text-xs text-slate-500">Recibe tu compra en la puerta de tu casa</span>
                    </button>

                    <button
                      onClick={() => setDeliveryMethod('PICK_UP')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                        deliveryMethod === 'PICK_UP' 
                          ? 'border-brand bg-brand/5' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <Store className={`w-6 h-6 ${deliveryMethod === 'PICK_UP' ? 'text-brand' : 'text-slate-400'}`} />
                      <span className="font-bold text-slate-800">Retiro en Tienda</span>
                      <span className="text-xs text-slate-500">Busca tu pedido sin costo adicional</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {deliveryMethod === 'DELIVERY' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 overflow-hidden"
                      >
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            <MapPin className="w-4 h-4" />
                            Dirección de Entrega
                          </label>
                          <input
                            type="text"
                            value={selectedAddress}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                            placeholder="Ej: Av. Principal, Edificio Don Bosco, Apto 4A"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* Lista de Productos */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Productos en el carrito
                    </h2>
                    <button 
                      onClick={clearCart}
                      className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Vaciar todo
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                        {/* Img Placeholder - Minimalist */}
                        <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                          <ShoppingBasket className="w-6 h-6 text-slate-300" />
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 truncate">{item.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Bs. {Number(item.price).toFixed(2)} c/u</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg h-8 px-2">
                              <button 
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-brand font-bold"
                              >-</button>
                              <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-brand font-bold"
                              >+</button>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="font-black text-brand">
                                Bs. {(Number(item.price) * item.quantity).toFixed(2)}
                              </span>
                              <button 
                                onClick={() => removeItem(item.productId)}
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
                    Selecciona tu Método de Pago
                  </h2>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setPaymentMethod('PAGO_MOVIL')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                        paymentMethod === 'PAGO_MOVIL' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'PAGO_MOVIL' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-slate-800">Pago Móvil</span>
                        <span className="text-xs text-slate-500">Transferencia inmediata</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('ZELLE')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                        paymentMethod === 'ZELLE' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'ZELLE' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-slate-800">Zelle</span>
                        <span className="text-xs text-slate-500">Pagos en USD</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('EFECTIVO_DELIVERY')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                        paymentMethod === 'EFECTIVO_DELIVERY' 
                          ? 'border-brand bg-brand/5' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'EFECTIVO_DELIVERY' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-slate-800">Efectivo al Entregar</span>
                        <span className="text-xs text-slate-500">Paga billetes físicos al recibir</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('PUNTO_DELIVERY')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                        paymentMethod === 'PUNTO_DELIVERY' 
                          ? 'border-brand bg-brand/5' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'PUNTO_DELIVERY' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-slate-800">Punto de Venta</span>
                        <span className="text-xs text-slate-500">Llevaremos el punto a tu ubicación</span>
                      </div>
                    </button>
                  </div>

                  {/* Formularios Condicionales de Pago */}
                  <AnimatePresence>
                    {(paymentMethod === 'PAGO_MOVIL' || paymentMethod === 'ZELLE') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 overflow-hidden"
                      >
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                          {paymentMethod === 'PAGO_MOVIL' ? (
                            <div className="text-sm font-medium text-slate-600 bg-white p-4 rounded-xl border border-slate-100">
                              <p className="mb-1"><span className="font-bold text-slate-800">Banco:</span> Banesco (0134)</p>
                              <p className="mb-1"><span className="font-bold text-slate-800">Teléfono:</span> 0414-1234567</p>
                              <p><span className="font-bold text-slate-800">RIF/Cédula:</span> J-12345678-9</p>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-slate-600 bg-white p-4 rounded-xl border border-slate-100">
                              <p className="mb-1"><span className="font-bold text-slate-800">Correo Zelle:</span> pagos@minegocio.com</p>
                              <p><span className="font-bold text-slate-800">Titular:</span> Mi Negocio LLC</p>
                            </div>
                          )}

                          <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                              <Receipt className="w-4 h-4" />
                              Nro. de Referencia (Opcional si pagas luego)
                            </label>
                            <input
                              type="text"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              placeholder="Últimos 6 dígitos de la referencia"
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </section>
              </motion.div>
            )}
          </div>

          {/* Columna Derecha: Resumen Pegajoso */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
                Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span>Bs. {total.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>Costo de Envío {deliveryMethod === 'PICK_UP' && '(Gratis)'}</span>
                  <span>Bs. {shippingCost.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-800 uppercase">Total a Pagar</span>
                    <span className="text-2xl font-black text-brand">Bs. {finalTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-right text-xs text-slate-400 mt-1">Impuestos incluidos</p>
                </div>
              </div>

              {currentStep === 1 ? (
                <button
                  onClick={handleNextStep}
                  className="w-full bg-brand text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
                >
                  Ir a Pagar
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  disabled={isProcessing}
                  className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar y Realizar Pedido'}
                  {!isProcessing && <CheckCircle2 className="w-4 h-4" />}
                </button>
              )}
              
            </div>
          </div>

        </div>
      </main>

      <OrderSuccessModal
        isOpen={showSuccessModal}
        orderId={generatedOrderId}
        total={finalTotal}
        paymentMethod={paymentMethod}
        deliveryMethod={deliveryMethod}
        deliveryAddress={selectedAddress}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};
