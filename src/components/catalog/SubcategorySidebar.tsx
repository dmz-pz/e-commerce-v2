import React from 'react';
import { useGlobalCatalog } from '../../context/CatalogContext.tsx';
import { ChevronRight } from 'lucide-react';

export const SubcategorySidebar: React.FC = () => {
  const {
    subcategories,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedCategory,
    categories
  } = useGlobalCatalog();

  if (selectedCategory === 'all') return null;

  // Encontrar el nombre legible de la categoría seleccionada
  const activeCategoryObj = categories.find(
    (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
  );
  const categoryDisplayName = activeCategoryObj?.name || selectedCategory;

  // Lista de subcategorías con la opción 'Ver todo' al inicio
  const allOption = { id: 'all', name: 'Ver todo' };
  const listToDisplay = [allOption, ...(subcategories || [])];

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-40 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-xs font-black text-brand uppercase tracking-widest mb-6 px-2">
          {categoryDisplayName}
        </h3>

        <div className="space-y-1">
          {listToDisplay.map((sub) => {
            const subName = typeof sub === 'string' ? sub : sub.name;
            const subId = typeof sub === 'string' ? sub : sub.id;

            const isSelected =
              (subId === 'all' && (selectedSubcategory === 'all' || selectedSubcategory === 'Ver todo')) ||
              selectedSubcategory === subId ||
              selectedSubcategory === subName;

            return (
              <button
                key={subId}
                onClick={() => setSelectedSubcategory(subName === 'Ver todo' ? 'all' : subName)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${isSelected
                    ? 'bg-brand text-white shadow-md shadow-brand/20 font-black'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand'
                  }`}
              >
                <span>{subName}</span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }`} />
              </button>
            );
          })}
        </div>


      </div>
    </aside>
  );
};
