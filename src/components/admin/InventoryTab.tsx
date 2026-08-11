import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, Eye, EyeOff, Plus, FolderPlus, RefreshCw, Filter } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { OptimizedImage } from '../ui/OptimizedImage.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/productService.ts';
import { categoryService } from '../../services/categoryService.ts';
import { Pagination } from '../ui/Pagination.tsx';
import { FilterBottomSheet } from './FilterBottomSheet.tsx';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { ProductEditDrawer } from './ProductEditDrawer.tsx';
import { Pencil } from 'lucide-react';

interface InventoryTabProps {
  onCreateProduct?: () => void;
  onManageCategories?: () => void;
  onRefresh?: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  onCreateProduct,
  onManageCategories,
  onRefresh,
}) => {
  const queryClient = useQueryClient();
  const [inventorySearch, setInventorySearch] = useState('');
  const debouncedSearch = useDebounce(inventorySearch, 400);
  const [showFilters, setShowFilters] = useState(false);
  
  const [draftFilters, setDraftFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    status: 'all' as "all" | "active" | "inactive"
  });

  const [appliedFilters, setAppliedFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    status: 'all' as "all" | "active" | "inactive"
  });

  const [page, setPage] = useState(1);
  const limit = 12;

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categoriesList = categoriesData || [];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-products', page, debouncedSearch, appliedFilters.category, appliedFilters.minPrice, appliedFilters.maxPrice, appliedFilters.status],
    queryFn: () => productService.getProducts({ 
      includeInactive: true, 
      page, 
      limit, 
      search: debouncedSearch || undefined,
      categoryId: appliedFilters.category !== 'all' ? appliedFilters.category : undefined,
      minPrice: appliedFilters.minPrice ? parseFloat(appliedFilters.minPrice) : undefined,
      maxPrice: appliedFilters.maxPrice ? parseFloat(appliedFilters.maxPrice) : undefined,
      status: appliedFilters.status !== 'all' ? appliedFilters.status : undefined
    }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productService.updateProductActivity(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    }
  });

  const products = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  let appliedFiltersCount = 0;
  if (appliedFilters.category !== 'all') appliedFiltersCount++;
  if (appliedFilters.minPrice || appliedFilters.maxPrice) appliedFiltersCount++;
  if (appliedFilters.status !== 'all') appliedFiltersCount++;

  const handleClearFilters = () => {
    const resetState = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      status: 'all' as "all" | "active" | "inactive"
    };
    setDraftFilters(resetState);
    setAppliedFilters(resetState);
    setPage(1);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        key="inventory-panel"
        className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm"
        id="inventory-tab-panel"
      >
      {/* Table search filter bar */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4">
        
        {/* Mobile: Search + Icons in one line */}
        <div className="flex md:hidden items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar catálogo..."
              className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
              value={inventorySearch}
              onChange={(e) => {
                setInventorySearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="relative w-11 h-11 shrink-0 bg-slate-800 text-white rounded-xl flex items-center justify-center hover:bg-slate-900 transition-all shadow-sm"
            title="Filtros"
          >
            <Filter className="w-5 h-5" />
            {appliedFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                {appliedFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-products'] });
              if (onRefresh) onRefresh();
            }}
            className="w-11 h-11 shrink-0 bg-white border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center hover:text-brand transition-all shadow-sm"
            title="Refrescar"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin text-brand' : ''}`} />
          </button>
        </div>

        {/* Desktop: Original Layout */}
        <div className="hidden md:flex relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar catálogo por nombre, marca, categoría, o subcategoría..."
            className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-11 pr-4 text-xs font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
            value={inventorySearch}
            onChange={(e) => {
              setInventorySearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="hidden md:flex flex-row items-center gap-3 justify-end shrink-0 w-auto">
          <div className="text-[11px] font-mono font-bold text-slate-400 py-2.5 px-3 bg-white border border-slate-200 rounded-xl flex items-center justify-start gap-2 w-auto">
            {isFetching && <RefreshCw className="w-3 h-3 animate-spin text-brand" />}
            Mostrando {totalItems} productos
          </div>
          
          <div className="flex flex-row items-center gap-2 w-auto">
            <button
              onClick={() => setShowFilters(true)}
              className="relative flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest px-5 h-11 rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer border border-slate-200"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {appliedFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {appliedFiltersCount}
                </span>
              )}
            </button>
            {onManageCategories && (
              <button
                onClick={onManageCategories}
                className="flex-none flex items-center justify-center gap-2 bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest px-5 h-11 rounded-xl hover:bg-slate-900 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                Categorías
              </button>
            )}
            {onCreateProduct && (
              <button
                onClick={onCreateProduct}
                className="flex-none flex items-center justify-center gap-2 bg-brand text-white text-[11px] font-black uppercase tracking-widest px-6 h-11 rounded-xl hover:bg-brand-dark transition-all shadow-md shadow-brand/15 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cargar Producto
              </button>
            )}
          </div>
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
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-24 text-center text-slate-400 font-bold tracking-widest text-xs uppercase animate-pulse">
                  Cargando catálogo...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-24 text-center text-slate-400">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="font-bold tracking-tight text-base">Sin coincidencia de productos</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba refinando la búsqueda o carga un nuevo producto</p>
                </td>
              </tr>
            ) : products.map((p: Product) => (
              <tr 
                key={p.id} 
                onClick={() => setEditingProduct(p)}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors cursor-pointer group"
              >
                <td className="py-4.5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                      <OptimizedImage
                        src={p.images?.[0]?.thumbUrl || p.images?.[0]?.url}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full bg-transparent"
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
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${p.stock <= 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    p.stock < 15 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-slate-50 text-slate-700'
                    }`}>
                    {p.stock}
                  </span>
                </td>
                <td className="py-4.5 px-6 text-center">
                  <button
                    onClick={() => toggleMutation.mutate({ id: p.id, isActive: p.isActive === false })}
                    disabled={toggleMutation.isPending}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border disabled:opacity-50 ${p.isActive !== false
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50'
                      : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100/50'
                      }`}
                  >
                    {p.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {p.isActive !== false ? 'Mostrar' : 'Oculto'}
                  </button>
                </td>
                <td className="py-4.5 px-6 text-right text-[10px] font-mono text-slate-300">
                  <div className="flex items-center justify-end">
                    <span className="group-hover:hidden">{p.id.slice(0, 8)}</span>
                    <Pencil className="w-4 h-4 text-brand hidden group-hover:block" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Product Cards list */}
      <div className="md:hidden divide-y divide-slate-100">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
            Cargando catálogo...
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-400 px-4">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="font-bold tracking-tight text-sm">Sin coincidencia de productos</p>
          </div>
        ) : (
          products.map((p: Product) => (
            <div 
              key={p.id} 
              onClick={() => setEditingProduct(p)}
              className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col gap-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer my-2 mx-2"
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMutation.mutate({ id: p.id, isActive: p.isActive === false }); }}
                  disabled={toggleMutation.isPending}
                  className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all border shadow-sm disabled:opacity-50 ${p.isActive !== false
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50'
                    : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100/50'
                    }`}
                  title={p.isActive !== false ? 'Ocultar' : 'Mostrar'}
                >
                  {p.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-3 pr-10">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                  <OptimizedImage
                    src={p.images?.[0]?.thumbUrl || p.images?.[0]?.url}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full bg-transparent"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">{p.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{p.brand || 'Genérico'}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[8px] font-black text-brand bg-brand/5 px-1.5 py-0.5 rounded uppercase tracking-wide">{p.subcategory?.category?.name ?? '—'}</span>
                    <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-center">{p.subcategory?.name ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100/70 text-xs text-slate-500">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Precio</span>
                  {p.discountPrice ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-emerald-600">${Number(p.discountPrice).toFixed(2)}</span>
                      <span className="font-mono text-slate-300 line-through text-[9px]">${Number(p.price).toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="font-bold font-mono text-slate-800">${Number(p.price).toFixed(2)}</span>
                  )}
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Stock ({p.unit})</span>
                  <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${p.stock <= 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    p.stock < 15 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-slate-200/50 text-slate-700'
                    }`}>
                    {p.stock}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-start pt-0.5">
                <span className="text-[9px] font-mono text-slate-300 font-semibold">ID: {p.id.slice(0, 8)}...</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* FAB (Floating Action Button) on Mobile for "Cargar Producto" */}
      {onCreateProduct && (
        <button
          onClick={onCreateProduct}
          className="md:hidden fixed bottom-24 right-4 z-50 w-14 h-14 bg-brand text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] shadow-brand/40 hover:bg-brand-dark transition-transform active:scale-95"
          title="Cargar Producto"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
      </motion.div>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        categories={categoriesList}
        selectedCategory={draftFilters.category}
        setSelectedCategory={(val) => setDraftFilters(prev => ({ ...prev, category: val }))}
        minPrice={draftFilters.minPrice}
        setMinPrice={(val) => setDraftFilters(prev => ({ ...prev, minPrice: val }))}
        maxPrice={draftFilters.maxPrice}
        setMaxPrice={(val) => setDraftFilters(prev => ({ ...prev, maxPrice: val }))}
        statusFilter={draftFilters.status}
        setStatusFilter={(val) => setDraftFilters(prev => ({ ...prev, status: val }))}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setPage(1);
        }}
        onClear={handleClearFilters}
      />

      <ProductEditDrawer
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        }}
      />
    </>
  );
};
