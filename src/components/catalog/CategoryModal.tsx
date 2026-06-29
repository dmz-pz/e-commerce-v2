import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import { useGlobalCatalog } from '../../context/CatalogContext.tsx';
import { useNavigate, useLocation } from 'react-router-dom';

export const CategoryModal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    showCategoriesModal, 
    setShowCategoriesModal, 
    categories, 
    products, 
    setSelectedCategory,
    setSelectedSubcategory
  } = useGlobalCatalog();
  
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);

  if (!showCategoriesModal) return null;

  const handleCategorySelect = (category: string) => {
    setSelectedMainCategory(category);
  };

  const checkNavigation = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    if (selectedMainCategory) {
      checkNavigation();
      setSelectedCategory(selectedMainCategory);
      setSelectedSubcategory(subcategory);
      setShowCategoriesModal(false);
      setSelectedMainCategory(null);
    }
  };

  const getSubcategories = (category: string): string[] => {
    return ['all', ...Array.from(new Set<string>(products.filter(p => p.category === category).map(p => p.subcategory)))];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brand/20 backdrop-blur-md z-[200] md:hidden"
        onClick={() => setShowCategoriesModal(false)}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {selectedMainCategory && (
                <button 
                  onClick={() => setSelectedMainCategory(null)}
                  className="p-2 -ml-2 text-slate-400 hover:text-brand"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-black text-brand tracking-tight flex items-center gap-2 uppercase">
                <Grid className="w-5 h-5 text-accent" />
                {selectedMainCategory ? selectedMainCategory : 'Categorías'}
              </h2>
            </div>
            <button 
              onClick={() => setShowCategoriesModal(false)}
              className="p-2 bg-slate-50 text-slate-400 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
            <AnimatePresence mode="wait">
              {!selectedMainCategory ? (
                <motion.div
                  key="categories"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="grid grid-cols-1 gap-3"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => cat === 'all' ? (checkNavigation(), setSelectedCategory('all'), setShowCategoriesModal(false)) : handleCategorySelect(cat)}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group active:scale-[0.98] transition-all hover:bg-brand/5 border border-transparent hover:border-brand/10"
                    >
                      <span className="font-bold text-slate-700 capitalize">
                        {cat === 'all' ? 'Ver Todo' : cat}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand" />
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="subcategories"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {getSubcategories(selectedMainCategory).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubcategorySelect(sub)}
                      className="p-4 bg-slate-50 rounded-2xl text-center group active:scale-[0.98] transition-all hover:bg-brand/5 border border-transparent hover:border-brand/10"
                    >
                      <span className="font-bold text-slate-700 capitalize text-sm">
                        {sub === 'all' ? `Todo ${selectedMainCategory}` : sub}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
