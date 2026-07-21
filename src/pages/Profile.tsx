import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext.tsx';
import { User, MapPin, Phone, Mail, LogOut, Plus, Trash2, Edit2, Check, X, ChevronRight, ShoppingBag, Package, Clock, CheckCircle2, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo.tsx';
import { orderService } from '../services/orderService.ts';
import { Order, OrderStatus } from '../types/index.ts';

const Profile: React.FC = () => {
  const { user, logout, updateProfile, addAddress, updateAddress, deleteAddress } = useUser();
  const navigate = useNavigate();
  
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');
  const [tempPhone, setTempPhone] = useState(user?.phone || '');
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ street: '', city: '', state: '', zipCode: '' });

  // Estado para el historial de órdenes del cliente
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      orderService.getMyOrders()
        .then((data) => {
          setMyOrders(data || []);
          setLoadingOrders(false);
          if (window.location.hash === '#orders') {
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> Pendiente</span>;
      case OrderStatus.PICKING:
        return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Package className="w-3 h-3"/> En Preparación</span>;
      case OrderStatus.READY_TO_PAY:
        return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Listo para Pagar</span>;
      case OrderStatus.PAID:
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Truck className="w-3 h-3"/> Pagado / En Camino</span>;
      case OrderStatus.DELIVERED:
        return <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Entregado</span>;
      case OrderStatus.CANCELLED:
        return <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><X className="w-3 h-3"/> Cancelado</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar / Mini Info */}
        <div className="w-full lg:w-1/3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 drop-shadow-xl">
              <Logo className="w-full h-full" />
            </div>
            <h2 className="text-xl font-black text-brand uppercase tracking-tight">{user.name}</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">{user.email}</p>
            
            <button 
              onClick={handleLogout}
              className="w-full py-4 border border-red-100 bg-red-50 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </motion.div>

          {/* Quick Stats or Navigation */}
          <div className="bg-brand rounded-3xl p-8 text-white">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              Resumen de cuenta
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-white/60">
                <span>Total de pedidos</span>
                <span className="text-white font-black text-sm">{loadingOrders ? '...' : myOrders.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-white/60">
                <span>Miembro desde</span>
                <span className="text-white">Mayo 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-8">
          
          {/* Info Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-brand uppercase tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-brand/5 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-brand" />
                </div>
                Información Personal
              </h3>
              {!isEditingInfo ? (
                <button 
                  onClick={() => setIsEditingInfo(true)}
                  className="p-2 text-slate-400 hover:text-brand transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingInfo(false)} className="p-2 text-red-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                  <button onClick={handleUpdateInfo} className="p-2 text-green-500 hover:text-green-600"><Check className="w-5 h-5" /></button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</span>
                {isEditingInfo ? (
                  <input 
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                <p className="text-sm font-bold text-slate-400">{user.email}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</span>
                {isEditingInfo ? (
                  <input 
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="+54 123 456789"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.phone || 'No especificado'}</p>
                )}
              </div>
            </div>
          </motion.section>

          {/* Addresses Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-brand uppercase tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-brand/5 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand" />
                </div>
                Direcciones de Envío
              </h3>
              <button 
                onClick={() => setShowAddressForm(true)}
                className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all"
              >
                <Plus className="w-3 h-3" />
                Nueva Dirección
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
                    className="p-6 border border-slate-100 bg-slate-50/50 rounded-2xl relative group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand" />
                        {addr.isDefault && (
                          <span className="bg-accent text-brand text-[8px] font-black px-2 py-0.5 rounded uppercase">Principal</span>
                        )}
                      </div>
                      <button 
                        onClick={() => deleteAddress(addr.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">{addr.street}</p>
                    <p className="text-xs font-medium text-slate-400">{addr.city}, {addr.state} {addr.zipCode}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {user.addresses.length === 0 && !showAddressForm && (
                <div className="md:col-span-2 text-center py-12 px-8 border-2 border-dashed border-slate-100 rounded-3xl">
                  <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-400">No tienes direcciones guardadas</p>
                </div>
              )}
            </div>

            {/* Address Form Modal/Overlay-style */}
            <AnimatePresence>
              {showAddressForm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand/40 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 md:p-10"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-lg font-black text-brand uppercase tracking-tight">Agregar Dirección</h4>
                      <button onClick={() => setShowAddressForm(false)} className="text-slate-400 hover:text-brand transition-colors">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Calle y Número</label>
                        <input 
                          required
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700"
                          value={newAddr.street}
                          onChange={(e) => setNewAddr({...newAddr, street: e.target.value})}
                          placeholder="Av. Principal 123"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ciudad</label>
                          <input 
                            required
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Provincia/Estado</label>
                          <input 
                            required
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700"
                            value={newAddr.state}
                            onChange={(e) => setNewAddr({...newAddr, state: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Código Postal</label>
                        <input 
                          required
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700"
                          value={newAddr.zipCode}
                          onChange={(e) => setNewAddr({...newAddr, zipCode: e.target.value})}
                        />
                      </div>
                      <div className="pt-4">
                        <button 
                          type="submit"
                          className="w-full h-14 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all"
                        >
                          Guardar Dirección
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Orders History Section */}
          <motion.section 
            id="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-brand uppercase tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-brand/5 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-brand" />
                </div>
                Mis Pedidos Realizados
              </h3>
            </div>

            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-bold text-slate-400">Cargando tus pedidos...</p>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="text-center py-12 px-8 border-2 border-dashed border-slate-100 rounded-3xl">
                <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">Aún no has realizado ningún pedido</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 bg-brand text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-dark transition-all"
                >
                  Ir a comprar
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myOrders.map((order) => (
                  <div key={order.id} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-6 transition-all hover:border-slate-200">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-200/60">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-widest mb-1">
                          ID: {order.id.slice(0, 8)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span className="text-base font-black text-slate-900">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Productos ({order.items.length})</p>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                          <span>{item.name}</span>
                          <span className="text-slate-500 font-semibold">
                            {item.requestedQuantity} x ${Number(item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

        </div>
      </div>
    </main>
  );
};

export default Profile;
