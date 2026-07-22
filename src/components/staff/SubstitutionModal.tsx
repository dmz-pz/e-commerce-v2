import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, AlertTriangle, X } from 'lucide-react';
import { Product } from '../../types/index.ts';

interface SubstitutionModalProps {
  substitutingItem: { orderId: string, productId: string, name: string } | null;
  onClose: () => void;
  catalogProducts: Product[];
  onPerformSubstitution: (replacementProduct: Product) => Promise<void>;
  errorMessage: string | null;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  substitutingItem,
  onClose,
  catalogProducts,
  onPerformSubstitution,
  errorMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!substitutingItem) return null;

  const filteredCatalog = catalogProducts
    .filter(p => p.id !== substitutingItem.productId && p.isActive !== false)
    .filter(p => {
      const query = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(query) ||
             (p.brand && p.brand.toLowerCase().includes(query)) ||
             (p.subcategory?.name && p.subcategory.name.toLowerCase().includes(query)) ||
             (p.subcategory?.category?.name && p.subcategory.category.name.toLowerCase().includes(query));
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="substitution-overlay">
        {/* Backdrop clickable element */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-transparent cursor-default w-full h-full border-none outline-none"
          onClick={onClose}
          aria-label="Cerrar modal"
        />

        {/* Content Container */}
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] sm:max-h-[85vh] relative z-10"
        >
          {/* Encabezado */}
          <div className="p-6 border-b border-slate-100 shrink-0 bg-slate-50">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-mono font-black text-brand uppercase tracking-[0.25em]">Módulo de Sustituciones</span>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-250 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Sustituir Producto</h3>
            <p className="text-slate-500 text-[11px] font-medium mt-1">
              Reemplazando: <span className="font-bold text-slate-800">{substitutingItem.name}</span>
            </p>
          </div>

          {/* Barra de Búsqueda */}
          <div className="p-5 bg-slate-50/50 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar sustituto por nombre o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>
          </div>

          {/* Mensaje de Error Interno */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 font-bold text-[10px]">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Lista de Candidatos */}
          <div className="flex-1 overflow-y-auto p-5 space-y-2.5 no-scrollbar">
            {filteredCatalog.slice(0, 15).map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-white border border-slate-100 hover:border-brand/10 hover:shadow-sm rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop';
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs leading-none mb-1">{product.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-brand font-mono">${Number(product.discountPrice || product.price || 0).toFixed(2)}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">•</span>
                      <span className={`text-[10px] font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-550'}`}>
                        Stock: {product.stock} {product.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() => onPerformSubstitution(product)}
                  className="px-3 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-[9px] uppercase font-black tracking-widest disabled:opacity-30 disabled:bg-slate-100 disabled:text-slate-400 transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  Reemplazar
                </button>
              </div>
            ))}
            
            {catalogProducts.length > 0 && filteredCatalog.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                No se encontraron productos coherentes para el reemplazo
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
