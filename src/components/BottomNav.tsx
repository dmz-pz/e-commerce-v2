import React from 'react';
import { Home, Grid, ShoppingCart, User } from 'lucide-react';
import { useGlobalCatalog } from '../context/CatalogContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useUser } from '../context/UserContext.tsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Role } from '../types/index.ts';

export const BottomNav: React.FC = () => {
  const { setSelectedCategory, setSelectedSubcategory, setShowCart, setShowCategoriesModal } = useGlobalCatalog();
  const { items } = useCart();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (user && (user.role === Role.STAFF_PICKER || user.role === Role.ADMINISTRADOR || user.role === Role.DELIVERY)) {
    return null;
  }

  const handleCategoriesClick = () => {
    setShowCategoriesModal(true);
  };

  const handleHomeClick = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', onClick: handleHomeClick },
    { icon: <Grid className="w-5 h-5" />, label: 'Categorías', onClick: handleCategoriesClick },
    { 
      icon: (
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-brand text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-brand">
              {itemCount}
            </span>
          )}
        </div>
      ), 
      label: 'Carrito', 
      onClick: () => setShowCart(true) 
    },
    { 
      icon: <User className="w-5 h-5" />, 
      label: 'Mi Perfil', 
      onClick: () => navigate(user ? '/profile' : '/login') 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand border-t border-white/10 flex justify-around items-center h-16 px-4 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      {navItems.map((item, index) => (
        <button 
          key={index} 
          onClick={item.onClick} 
          className="flex-1 py-1 flex flex-col items-center gap-1 group active:scale-95 transition-transform"
        >
          <div className="text-white/60 group-active:text-accent transition-colors">
            {item.icon}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 group-active:text-accent transition-colors">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};
