import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Minus, User, CreditCard, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { productService } from '../../services/productService.ts';
import { userService } from '../../services/userService.ts';
import { CedulaInput } from '../ui/CedulaInput.tsx';
import { PhoneInput } from '../ui/PhoneInput.tsx';
import { Input } from '../ui/Input.tsx';
import { useGlobalCatalog } from '../../context/CatalogContext.tsx';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onOrderCreated }) => {
  const { exchangeRate } = useGlobalCatalog();
  const [step, setStep] = useState<1 | 2>(1); // 1: Datos Cliente & Productos, 2: Pago

  // Datos Cliente
  const [customerName, setCustomerName] = useState('');
  const [customerCedula, setCustomerCedula] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Búsqueda y Productos
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBlur = async (field: 'cedula' | 'phone', value: string) => {
    if (!value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return;
    }
    try {
      const check = await userService.checkAvailability({ [field]: value });
      if (check.status !== 'success') {
        setErrors(prev => ({ ...prev, [field]: check.message || `Este ${field} ya está registrado` }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (err: any) {
      if (err.data?.issues) {
        err.data.issues.forEach((issue: any) => {
          if (issue.path && issue.path[0] === field) {
            setErrors(prev => ({ ...prev, [field]: issue.message }));
          }
        });
      } else if (err.response?.data?.message) {
        setErrors(prev => ({ ...prev, [field]: err.response.data.message }));
      } else if (err.message) {
        setErrors(prev => ({ ...prev, [field]: err.message }));
      }
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Carrito Local
  const [cartItems, setCartItems] = useState<Array<{ product: Product, quantity: number }>>([]);

  // Pago
  const [paymentMethod, setPaymentMethod] = useState<'PAGO_MOVIL' | 'ZELLE' | 'BINANCE' | 'EFECTIVO_DELIVERY' | 'PUNTO_DELIVERY'>('PUNTO_DELIVERY');
  const [paymentReference, setPaymentReference] = useState('');

  // Envío al servidor
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Debounce para búsqueda
  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery.trim()) {
        setProducts([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const res = await productService.getProducts({ search: searchQuery, limit: 5 });
        setProducts(res.items);
      } catch (err) {
        console.error("Error buscando productos:", err);
      } finally {
        setLoadingSearch(false);
      }
    };

    const timeoutId = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearchQuery('');
    setProducts([]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
  const subtotalBs = subtotal * exchangeRate;

  const totalIvaBs = cartItems.reduce((acc, item) => {
    const rawPercentage = item.product.taxRate?.percentage;
    const percentage = rawPercentage !== undefined ? Number(rawPercentage) : undefined;
    
    if (percentage !== undefined && !isNaN(percentage) && percentage > 0) {
      const numPrice = Number(String(item.product.price));
      const bsPrice = numPrice * exchangeRate;
      const itemIva = bsPrice * (percentage / (100 + percentage));
      return acc + (itemIva * item.quantity);
    }
    return acc;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (Object.values(errors).some(Boolean)) {
        setErrorMessage('Por favor, corrige los errores de Cédula o Teléfono antes de continuar.');
        return;
      }
      if (!customerName || !customerCedula || !customerPhone) {
        setErrorMessage('Todos los datos del cliente son requeridos.');
        return;
      }
      if (cartItems.length === 0) {
        setErrorMessage('Debe agregar al menos un producto.');
        return;
      }
      setErrorMessage('');
      setStep(2);
      return;
    }

    // Step 2: Submit al servidor
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        paymentMethod,
        paymentReference: paymentReference || undefined,
        customerData: {
          name: customerName,
          cedula: customerCedula,
          phone: customerPhone
        },
        items: cartItems.map(item => ({
          productId: item.product.id,
          requestedQuantity: item.quantity
        }))
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la orden.');
      }

      onOrderCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl flex flex-col h-[90vh] md:h-[80vh] relative z-10 overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-black text-brand uppercase tracking-[0.2em] block">
                  Operaciones de Venta
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5">
                  Nueva Orden
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-200/50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="m-6 mb-0 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 font-bold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            {/* Left Column - Form */}
            <form id="create-order-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 border-r border-slate-100 flex flex-col gap-6">

              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {/* Datos del Cliente */}
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                      <User className="w-3 h-3" /> Datos del Cliente
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div onBlur={() => handleBlur('cedula', customerCedula)}>
                          <CedulaInput
                            label="Cédula"
                            value={customerCedula}
                            onChange={val => { setCustomerCedula(val); setErrors(prev => ({ ...prev, cedula: '' })); }}
                          />
                        </div>
                        {errors.cedula && (
                          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
                            {errors.cedula}
                          </motion.p>
                        )}
                      </div>
                      <div>
                        <div onBlur={() => handleBlur('phone', customerPhone)}>
                          <PhoneInput
                            label="Teléfono"
                            value={customerPhone}
                            onChange={val => { setCustomerPhone(val); setErrors(prev => ({ ...prev, phone: '' })); }}
                          />
                        </div>
                        {errors.phone && (
                          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
                            {errors.phone}
                          </motion.p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Nombre Completo"
                          required
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="Juan Pérez"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Búsqueda de Productos */}
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                      <Search className="w-3 h-3" /> Agregar Productos
                    </h4>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar producto por nombre..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-brand outline-none"
                      />
                      {loadingSearch && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand animate-spin" />}

                      {/* Resultados de Búsqueda */}
                      {products.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20">
                          {products.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleAddToCart(p)}
                              className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <div>
                                <span className="block text-xs font-bold text-slate-800">{p.name}</span>
                                <span className="text-[10px] text-slate-400">${Number(p.price).toFixed(2)}</span>
                              </div>
                              <Plus className="w-4 h-4 text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                      <CreditCard className="w-3 h-3" /> Información de Pago
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Método de Pago</label>
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:border-brand outline-none"
                        >
                          <option value="PUNTO_DELIVERY">Punto de Venta (Físico)</option>
                          <option value="EFECTIVO_DELIVERY">Efectivo</option>
                          <option value="PAGO_MOVIL">Pago Móvil</option>
                          <option value="ZELLE">Zelle</option>
                          <option value="BINANCE">Binance</option>
                        </select>
                      </div>


                    </div>
                  </div>
                </motion.div>
              )}
            </form>

            {/* Right Column - Cart Summary */}
            <div className="w-1/3 bg-slate-50 flex flex-col p-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Resumen del Pedido</h4>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-medium">Carrito vacío</span>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.product.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-[10px] text-slate-500">${Number(item.product.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                        <button type="button" onClick={() => updateQuantity(item.product.id, -1)} className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.product.id, 1)} className="p-1 text-slate-400 hover:text-brand cursor-pointer">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.product.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors cursor-pointer ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimado</span>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900">${subtotal.toFixed(2)}</div>
                  <div className="text-[11px] font-bold text-slate-500">Bs. {subtotalBs.toFixed(2)}</div>
                  <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                    {totalIvaBs > 0 ? `I.V.A Bs: (${totalIvaBs.toFixed(2)})` : 'Exento de I.V.A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Volver
              </button>
            ) : (
              <div /> // Spacer
            )}

            <button
              type="submit"
              form="create-order-form"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-brand/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>{step === 1 ? 'Continuar al Pago' : 'Crear Orden'}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
