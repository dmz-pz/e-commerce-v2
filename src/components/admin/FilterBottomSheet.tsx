import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Filter, Tag, DollarSign, Eye } from 'lucide-react';
import { Category } from '../../types/index.ts';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (val: "all" | "active" | "inactive") => void;
  onApply: () => void;
  onClear: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  statusFilter,
  setStatusFilter,
  onApply,
  onClear
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[120] flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800">
                <Filter className="w-5 h-5 text-brand" />
                <h3 className="font-black uppercase tracking-widest text-sm">Filtros Avanzados</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Category */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Tag className="w-4 h-4" />
                  <label className="text-[11px] font-black uppercase tracking-widest">Categoría</label>
                </div>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign className="w-4 h-4" />
                  <label className="text-[11px] font-black uppercase tracking-widest">Rango de Precio ($)</label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="Mínimo"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    />
                  </div>
                  <span className="text-slate-300 font-bold">-</span>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="Máximo"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Eye className="w-4 h-4" />
                  <label className="text-[11px] font-black uppercase tracking-widest">Estado (Visibilidad)</label>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === "all" ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setStatusFilter("active")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === "active" ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Mostrados
                  </button>
                  <button 
                    onClick={() => setStatusFilter("inactive")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === "inactive" ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Ocultos
                  </button>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-100 flex items-center gap-3 bg-white pb-safe">
              <button 
                onClick={onClear}
                className="px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors"
              >
                Limpiar
              </button>
              <button 
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="flex-1 bg-brand text-white rounded-xl py-3.5 text-xs font-black uppercase tracking-widest shadow-md shadow-brand/20 hover:bg-brand-dark transition-colors active:scale-95"
              >
                Aplicar Filtros
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
