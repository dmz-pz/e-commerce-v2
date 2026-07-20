import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, Eye, EyeOff } from 'lucide-react';
import { Product } from '../../types/index.ts';

interface InventoryTabProps {
  products: Product[];
  onToggleProductActive: (id: string, currentStatus: boolean) => Promise<void>;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  onToggleProductActive,
}) => {
  const [inventorySearch, setInventorySearch] = useState('');

  // Filter Inventory
  const filteredProducts = products.filter(p => {
    const search = inventorySearch.toLowerCase();
    const categoryName = p.subcategory?.category?.name?.toLowerCase() ?? '';
    const subcategoryName = p.subcategory?.name?.toLowerCase() ?? '';
    return (
      p.name.toLowerCase().includes(search) ||
      categoryName.includes(search) ||
      subcategoryName.includes(search) ||
      (p.brand && p.brand.toLowerCase().includes(search))
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="inventory-panel"
      className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm"
      id="inventory-tab-panel"
    >
      {/* Table search filter bar */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Filtrar catálogo por nombre, marca, categoría, o subcategoría..."
            className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-11 pr-4 text-xs font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
          />
        </div>
        <div className="text-[11px] font-mono font-bold text-slate-400 py-1.5 px-3 bg-white border border-slate-200 rounded-lg shrink-0">
          Mostrando {filteredProducts.length} productos
        </div>
      </div>

      {/* Table of products (Desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black bg-slate-50/20">
              <th className="py-4.5 px-6">Producto</th>
              <th className="py-4.5 px-6">Categoría / Subcategoría</th>
              <th className="py-4.5 px-6">Precio Regulado</th>
              <th className="py-4.5 px-6 text-center">Unidad</th>
              <th className="py-4.5 px-6 text-center">Stock</th>
              <th className="py-4.5 px-6 text-center">Mostrar en E-Commerce</th>
              <th className="py-4.5 px-6 text-right">Id</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-24 text-center text-slate-400">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="font-bold tracking-tight text-base">Sin coincidencia de productos</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba refinando la búsqueda o carga un nuevo producto</p>
                </td>
              </tr>
            ) : filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                <td className="py-4.5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                      <img 
                        src={p.images?.[0]?.url} 
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm tracking-tight">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.brand || 'Genérico'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4.5 px-6">
                  <span className="text-xs font-bold text-slate-700 block">{p.subcategory?.category?.name ?? '—'}</span>
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">{p.subcategory?.name ?? '—'}</span>
                </td>
                <td className="py-4.5 px-6">
                  <div className="flex flex-col">
                    {p.discountPrice ? (
                      <>
                        <span className="text-xs font-bold font-mono text-emerald-600">${Number(p.discountPrice).toFixed(2)}</span>
                        <span className="text-[10px] font-bold font-mono text-slate-300 line-through">${Number(p.price).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-xs font-bold font-mono text-slate-800">${Number(p.price).toFixed(2)}</span>
                    )}
                  </div>
                </td>
                <td className="py-4.5 px-6 text-center text-xs font-bold text-slate-600">
                  {p.unit}
                </td>
                <td className="py-4.5 px-6 text-center">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    p.stock <= 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    p.stock < 15 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    {p.stock}
                  </span>
                </td>
                <td className="py-4.5 px-6 text-center">
                  <button
                    onClick={() => onToggleProductActive(p.id, p.isActive !== false)}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border ${
                      p.isActive !== false
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50'
                        : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100/50'
                    }`}
                  >
                    {p.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {p.isActive !== false ? 'Mostrar' : 'Oculto'}
                  </button>
                </td>
                <td className="py-4.5 px-6 text-right text-[10px] font-mono text-slate-300">
                  {p.id.slice(0, 8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Product Cards list */}
      <div className="md:hidden divide-y divide-slate-100">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="font-bold tracking-tight text-sm">Sin coincidencia de productos</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className="p-5 flex flex-col gap-3.5 hover:bg-slate-50/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                  <img 
                    src={p.images?.[0]?.url} 
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate leading-snug">{p.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{p.brand || 'Genérico'}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-black text-brand bg-brand/5 px-2 py-0.5 rounded uppercase tracking-wide">{p.subcategory?.category?.name ?? '—'}</span>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-center">{p.subcategory?.name ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100/70 text-xs text-slate-500">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Precio</span>
                  {p.discountPrice ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-emerald-600">${Number(p.discountPrice).toFixed(2)}</span>
                      <span className="font-mono text-slate-300 line-through text-[10px]">${Number(p.price).toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="font-bold font-mono text-slate-800">${Number(p.price).toFixed(2)}</span>
                  )}
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Stock ({p.unit})</span>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    p.stock <= 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    p.stock < 15 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-200/50 text-slate-700'
                  }`}>
                    {p.stock}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[9px] font-mono text-slate-300 font-semibold">ID: {p.id.slice(0, 8)}...</span>
                <button
                  onClick={() => onToggleProductActive(p.id, p.isActive !== false)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border ${
                    p.isActive !== false
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50'
                      : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100/50'
                  }`}
                >
                  {p.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {p.isActive !== false ? 'Mostrar' : 'Oculto'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
