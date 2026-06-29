import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobalCatalog } from '../../context/CatalogContext.tsx';

export const CategoryCircularNav: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useGlobalCatalog();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  // Mapeo de iconos/colores simplificado para las categorías
  const categoryAssets: Record<string, { icon: string, bg: string }> = {
    'all': { icon: '🏢', bg: 'bg-slate-100' },
    'Frutas y Verduras': { icon: '🍎', bg: 'bg-green-50' },
    'Lácteos': { icon: '🥛', bg: 'bg-blue-50' },
    'Despensa': { icon: '🥫', bg: 'bg-orange-50' },
    'Cuidado Personal': { icon: '🧴', bg: 'bg-pink-50' },
    'Bebidas': { icon: '🥤', bg: 'bg-amber-50' },
  };

  return (
    <div className="md:hidden mb-8">
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Compra por categoría</h3>
        <button className="text-[10px] font-black text-brand uppercase tracking-widest">Ver Todo</button>
      </div>
      <div className="flex overflow-x-auto no-scrollbar gap-4 -mx-4 px-10">
        {categories.map((cat) => {
          const asset = categoryAssets[cat] || { icon: '📦', bg: 'bg-slate-50' };
          const isActive = selectedCategory === cat;
          
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all border-2 ${
                isActive ? 'border-brand bg-white shadow-lg' : 'border-transparent ' + asset.bg
              }`}>
                {asset.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-tight text-center max-w-[70px] leading-tight ${
                isActive ? 'text-brand' : 'text-slate-500'
              }`}>
                {cat === 'all' ? 'Ver todo' : cat}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
