import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext.tsx';
import { User, MapPin, LogOut, Plus, Trash2, Edit2, Check, X, ShoppingBag, Package, Clock, CheckCircle2, Truck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService.ts';
import { Order, OrderStatus } from '../types/index.ts';

const Profile: React.FC = () => {
  const { user, logout, updateProfile, addAddress, deleteAddress, updateAddress } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'orders'>('info');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');
  const [tempPhone, setTempPhone] = useState(user?.phone || '');

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ street: '', city: '', state: '', zipCode: '' });

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      orderService.getMyOrders()
        .then((data) => {
          setMyOrders(data || []);
          setLoadingOrders(false);
          if (window.location.hash === '#orders') {
            setActiveTab('orders');
            setTimeout(() => {
              const el = document.getElementById('orders');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        })
        .catch((err) => {
          console.error("Error al obtener compras del usuario:", err);
          setLoadingOrders(false);
        });
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUpdateInfo = async () => {
    await updateProfile({ name: tempName, phone: tempPhone });
    setIsEditingInfo(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAddress({ ...newAddr, isDefault: user.addresses.length === 0 });
    setShowAddressForm(false);
    setNewAddr({ street: '', city: '', state: '', zipCode: '' });
  };

  const handleSetDefaultAddress = async (id: string) => {
    await updateAddress(id, { isDefault: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 30) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>;
      case OrderStatus.PICKING:
        return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Package className="w-3 h-3" /> Preparación</span>;
      case OrderStatus.READY_TO_PAY:
        return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Listo para Pagar</span>;
      case OrderStatus.PAID:
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Truck className="w-3 h-3" /> Pagado / Envío</span>;
      case OrderStatus.DELIVERED:
        return <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Entregado</span>;
      case OrderStatus.CANCELLED:
        return <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><X className="w-3 h-3" /> Cancelado</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-brand text-white rounded-full flex items-center justify-center text-3xl font-black shadow-lg shadow-brand/30">
              {getInitials(user.name)}
            </div>
            <h2 className="text-xl font-black text-brand uppercase tracking-tight">{user.name}</h2>
            <p className="text-slate-500 text-sm font-medium mb-8">{user.email}</p>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full py-4 border border-red-100 bg-red-50 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </motion.div>

          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-2">
            <button onClick={() => setActiveTab('info')} className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all ${activeTab === 'info' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-500 hover:bg-slate-50'}`}>
              <User className="w-5 h-5" /> Información Personal
            </button>
            <button onClick={() => setActiveTab('addresses')} className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all ${activeTab === 'addresses' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-500 hover:bg-slate-50'}`}>
              <MapPin className="w-5 h-5" /> Mis Direcciones
            </button>
            <button onClick={() => setActiveTab('orders')} className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-500 hover:bg-slate-50'}`}>
              <ShoppingBag className="w-5 h-5" /> Historial de Pedidos
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full relative">
          <AnimatePresence mode="wait">

            {/* INFO TAB */}
            {activeTab === 'info' && (
              <motion.section
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                  <h3 className="text-lg font-black text-brand uppercase tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand/5 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-brand" />
                    </div>
                    Información Personal
                  </h3>
                  {!isEditingInfo && (
                    <button
                      onClick={() => setIsEditingInfo(true)}
                      className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Nombre Completo</span>
                    {isEditingInfo ? (
                      <input
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                      />
                    ) : (
                      <p className="text-base font-bold text-slate-800">{user.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Correo Electrónico</span>
                    <p className="text-base font-bold text-slate-500">{user.email}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Teléfono de Contacto</span>
                    {isEditingInfo ? (
                      <input
                        className="w-full md:w-1/2 h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        placeholder="+58 414 1234567"
                      />
                    ) : (
                      <p className="text-base font-bold text-slate-800">{user.phone || 'No especificado'}</p>
                    )}
                  </div>
                </div>

                {isEditingInfo && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4 justify-end">
                    <button
                      onClick={() => setIsEditingInfo(false)}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpdateInfo}
                      className="px-6 py-3 bg-brand text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Guardar Cambios
                    </button>
                  </div>
                )}
              </motion.section>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <motion.section
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                  <h3 className="text-lg font-black text-brand uppercase tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand/5 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-brand" />
                    </div>
                    Mis Direcciones
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nueva Dirección</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {user.addresses.map((addr) => (
                      <motion.div
                        key={addr.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-6 border-2 rounded-2xl relative flex flex-col justify-between ${addr.isDefault ? 'border-brand bg-brand/5' : 'border-slate-100 bg-slate-50/50'}`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-5 h-5 ${addr.isDefault ? 'text-brand' : 'text-slate-400'}`} />
                              {addr.isDefault && (
                                <span className="bg-brand text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Principal</span>
                              )}
                            </div>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="p-2 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Eliminar dirección"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-base font-bold text-slate-800 mb-1">{addr.street}</p>
                          <p className="text-sm font-medium text-slate-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                        </div>

                        {!addr.isDefault && (
                          <div className="mt-6 pt-4 border-t border-slate-200/60">
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs font-bold text-brand flex items-center gap-1 hover:text-brand-dark transition-colors"
                            >
                              <Star className="w-3 h-3" /> Hacer Principal
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {user.addresses.length === 0 && !showAddressForm && (
                    <div className="md:col-span-2 text-center py-16 px-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                      <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-base font-bold text-slate-500 mb-2">No tienes direcciones guardadas</p>
                      <p className="text-sm text-slate-400">Agrega una dirección para facilitar tus próximos pedidos.</p>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.section
                id="orders"
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                  <h3 className="text-lg font-black text-brand uppercase tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand/5 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-brand" />
                    </div>
                    Historial de Pedidos
                  </h3>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-16">
                    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-bold text-slate-500">Cargando tu historial...</p>
                  </div>
                ) : myOrders.length === 0 ? (
                  <div className="text-center py-16 px-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-base font-bold text-slate-500 mb-2">Aún no has realizado ningún pedido</p>
                    <p className="text-sm text-slate-400 mb-6">Explora nuestro catálogo y encuentra lo que necesitas.</p>
                    <button
                      onClick={() => navigate('/')}
                      className="bg-brand text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                    >
                      Ir a comprar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myOrders.map((order) => (
                      <div key={order.id} className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-brand/30">
                        <div className="bg-slate-50 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-slate-200/60">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-bold text-slate-800">
                                Pedido #{order.id.slice(0, 8)}
                              </span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                                {getRelativeDate(order.createdAt)}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(order.status)}
                            <span className="text-lg font-black text-brand">${Number(order.total).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="p-6">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Productos en este pedido ({order.items.length})</p>
                          <div className="space-y-3 mb-6">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 text-sm font-bold text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                {item.product?.images?.[0]?.url ? (
                                  <img src={item.product.images[0].url} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-200" />
                                ) : (
                                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-slate-300">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                  <p className="text-xs text-slate-500 font-semibold">{item.requestedQuantity} x ${Number(item.price).toFixed(2)}</p>
                                </div>
                                <div className="text-right font-black text-brand">
                                  ${(item.requestedQuantity * Number(item.price)).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors">
                              Ver Detalle
                            </button>
                            <button
                              onClick={() => navigate('/')}
                              className="px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-dark transition-colors shadow-md shadow-brand/20"
                            >
                              Volver a Comprar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 md:p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-lg font-black text-brand uppercase tracking-tight">Agregar Dirección</h4>
                <button onClick={() => setShowAddressForm(false)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Calle y Número</label>
                  <input
                    required
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    placeholder="Av. Principal 123"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Ciudad</label>
                    <input
                      required
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Estado</label>
                    <input
                      required
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Código Postal</label>
                  <input
                    required
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    value={newAddr.zipCode}
                    onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                  />
                </div>
                <div className="pt-6 border-t border-slate-100 flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-14 bg-brand text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">¿Cerrar Sesión?</h3>
              <p className="text-sm font-medium text-slate-500 mb-8">Tendrás que volver a ingresar tus credenciales para acceder a tu cuenta.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                >
                  Salir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Profile;
