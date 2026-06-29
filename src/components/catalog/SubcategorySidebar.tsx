import React from 'react';
import { useGlobalCatalog } from '../../context/CatalogContext.tsx';
import { ChevronRight } from 'lucide-react';

export const SubcategorySidebar: React.FC = () => {
  const { 
    subcategories, 
    selectedSubcategory, 
    setSelectedSubcategory, 
    selectedCategory 
  } = useGlobalCatalog();

  if (selectedCategory === 'all' || subcategories.length <= 1) return null;

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-40 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-xs font-black text-brand uppercase tracking-widest mb-6 px-2">
          {selectedCategory}
        </h3>
        
        <div className="space-y-1">
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                selectedSubcategory === sub
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-brand'
              }`}
            >
              <span>{sub === 'all' ? 'Ver todo' : sub}</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                selectedSubcategory === sub ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
              }`} />
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 px-2">
          <div className="bg-brand/5 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-brand uppercase tracking-tighter leading-tight">
              PROXIMAMENTE:
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Filtros por precio y marca para {selectedCategory.toLowerCase()}.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
