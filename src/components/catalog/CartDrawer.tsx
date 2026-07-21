import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ShoppingBasket, ChevronRight, LogIn } from 'lucide-react';
import { useGlobalCatalog } from '../../context/CatalogContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useUser } from '../../context/UserContext.tsx';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { showCart, setShowCart, checkoutLoading, handleCheckout } = useGlobalCatalog();
  const { items, total, removeItem } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const onCheckoutClick = () => {
    if (!user) {
      setShowCart(false);
      navigate('/login?redirect=/checkout');
      return;
    }
    setShowCart(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {showCart && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
            className="fixed inset-0 bg-brand/20 backdrop-blur-sm z-[150]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:max-w-md bg-white shadow-2xl z-[160] p-6 md:p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 tracking-tight text-brand">
                <ShoppingBasket className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                Tu Carrito
              </h2>
              <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-brand p-2">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-2 custom-scrollbar">
              {items.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <ShoppingBasket className="w-12 h-12 text-slate-100 mb-4" />
                  <p className="text-slate-400 font-medium">Tu carrito está vacío</p>
                </div>
              ) : items.map(item => (
                <div key={item.productId} className="flex justify-between items-center group bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-brand/5 border border-transparent hover:border-brand/10 transition-all">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-bold text-slate-900 text-sm md:text-base truncate">{item.name}</h4>
                    <p className="text-[10px] md:text-xs text-slate-400 font-mono">{item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="font-bold text-brand font-mono text-sm md:text-base">${(item.price * item.quantity).toFixed(2)}</span>
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 md:pt-8 border-t border-slate-100 mt-6 md:mt-8">
              {!user && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-2 bg-red-50 py-2 rounded-lg border border-red-100">
                  <LogIn className="w-3 h-3" />
                  Inicia sesión para finalizar
                </p>
              )}
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <span className="text-slate-400 font-medium font-mono uppercase text-[9px] md:text-[10px] tracking-widest">Total Estimado</span>
                <span className="text-2xl md:text-3xl font-bold text-brand tracking-tighter">${total.toFixed(2)}</span>
              </div>
              <button 
                disabled={items.length === 0 || checkoutLoading}
                onClick={onCheckoutClick}
                className="w-full bg-brand text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 shadow-xl shadow-brand/20"
              >
                {!user ? 'Iniciar Sesión para Pedir' : checkoutLoading ? 'Procesando...' : 'Finalizar Pedido'}
                {!checkoutLoading && <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
