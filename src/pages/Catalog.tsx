import React from 'react';
import { ShoppingBasket, Star, Tag, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalCatalog } from '../context/CatalogContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { PromoCarousel } from '../components/catalog/PromoCarousel.tsx';
import { ProductCard } from '../components/catalog/ProductCard.tsx';
import { FidelityBanner, RecipesBanner, EcoFreshBanner } from '../components/catalog/AdvertisingSection.tsx';
import { ProductSection } from '../components/catalog/ProductSection.tsx';
import { SubcategorySidebar } from '../components/catalog/SubcategorySidebar.tsx';
import { BentoPromos } from '../components/catalog/BentoPromos.tsx';
import { PaginationBar } from '../components/catalog/PaginationBar.tsx';

export const Catalog: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    subcategories,
    searchQuery,
    loading,
    showCart,
    setShowCart,
    filteredProducts,
    recommendedProducts,
    discountedProducts,
    bestSellers,
    page,
    setPage,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    totalProducts,
    totalPages,
  } = useGlobalCatalog();

  const { items, total } = useCart();

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
    </div>
  );

  const isGeneralCatalog = selectedCategory === 'all' && searchQuery === '';

  return (
    <main className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
      {/* Mobile Special Content */}
      {selectedCategory === 'all' && searchQuery === '' && (
        <div className="md:hidden">
          <BentoPromos />
        </div>
      )}

      <header className="hidden md:flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-brand font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Bienvenido a Supermercado</span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            Tu Super,<br /><span className="text-brand">Más Fresco.</span>
          </h1>
        </div>
        <div className="hidden lg:flex gap-8 items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Entrega Promedio</span>
            <span className="block text-xl font-bold text-brand tracking-tight">25 - 40 min</span>
          </div>
          <div className="w-px h-10 bg-slate-100" />
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Costo de Envío</span>
            <span className="block text-xl font-bold text-accent tracking-tight">¡Gratis!</span>
          </div>
        </div>
      </header>
      
      {/* Portada Principal: Carrusel y Secciones Destacadas (Máx 10 por bloque) */}
      {selectedCategory === 'all' && searchQuery === '' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="hidden md:block mb-12">
            <PromoCarousel onCategorySelect={setSelectedCategory} />
          </div>

          <ProductSection 
            title="Seleccionamos para ti"
            subtitle="Basado en tus preferencias"
            products={recommendedProducts}
            icon={<Star className="w-5 h-5 fill-brand" />}
          />

          <FidelityBanner />

          <ProductSection 
            title="Ofertas Imperdibles"
            subtitle="Precios que te harán sonreír"
            products={discountedProducts}
            icon={<Tag className="w-5 h-5" />}
          />

          <RecipesBanner />

          <ProductSection 
            title="Los Más Vendidos"
            subtitle="Favoritos de nuestra comunidad"
            products={bestSellers}
            icon={<TrendingUp className="w-5 h-5" />}
          />

          <EcoFreshBanner />
        </div>
      )}

      {/* Vista de Catálogo por Categoría / Subcategoría o Búsqueda */}
      {!isGeneralCatalog && (
        <div className="mt-8 flex flex-col lg:flex-row gap-10">
          <SubcategorySidebar />

          <div className="flex-1">
            {/* Header del Catálogo y Controles de Filtros */}
            <div className="mb-6 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-brand" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {searchQuery !== '' ? `Buscando "${searchQuery}"` : `Explorando ${selectedCategory}`}
                </h2>
              </div>

              {/* Toolbar: Comprar por (Ordenamiento) + Artículos por página */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-xs font-bold text-slate-500">Comprar por</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
                  >
                    <option value="relevance">Relevancia</option>
                    <option value="price_asc">Menor Precio</option>
                    <option value="price_desc">Mayor Precio</option>
                    <option value="name_asc">Nombre (A-Z)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="top-limit-select" className="text-xs font-bold text-slate-500">Artículos por página</label>
                  <select
                    id="top-limit-select"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Subcategory Chips */}
            {selectedCategory !== 'all' && subcategories.length > 0 && (
              <div className="flex lg:hidden overflow-x-auto custom-scrollbar gap-2 mb-6 -mx-4 px-10">
                {subcategories.map((sub) => {
                  const subName = typeof sub === 'string' ? sub : sub.name;
                  const subId = typeof sub === 'string' ? sub : sub.id;
                  return (
                    <button
                      key={subId}
                      onClick={() => setSelectedSubcategory(subName)}
                      className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                        selectedSubcategory === subName || selectedSubcategory === subId
                          ? 'bg-brand text-white shadow-md shadow-brand/20'
                          : 'bg-white text-slate-400 border border-slate-100 hover:border-brand/30'
                      }`}
                    >
                      {subName === 'all' ? 'Ver todo' : subName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Grilla de productos */}
            <div className="w-full">
              <div className="flex md:grid overflow-x-auto md:overflow-visible pb-8 md:pb-0 gap-4 md:gap-6 items-stretch custom-scrollbar -mx-4 px-10 md:-mx-0 md:px-0 snap-x md:snap-none md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                <AnimatePresence mode='popLayout'>
                  {filteredProducts.length === 0 && (
                    <motion.div 
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full w-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200"
                    >
                      <ShoppingBasket className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs px-4">Sin resultados • Intenta otra búsqueda o subcategoría</p>
                    </motion.div>
                  )}

                  {filteredProducts.length > 0 && filteredProducts.map((product) => (
                    <div key={product.id} className="w-[160px] md:w-full shrink-0 snap-start flex">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Barra de Paginación Inferior */}
            <PaginationBar 
              page={page}
              totalPages={totalPages}
              totalProducts={totalProducts}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        </div>
      )}

      {/* Floating Cart Launcher */}
      {items.length > 0 && !showCart && (
        <motion.button
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          onClick={() => setShowCart(true)}
          className="hidden md:flex fixed bottom-8 right-8 bg-brand text-white px-8 py-4 rounded-full shadow-2xl items-center gap-3 z-40 hover:bg-brand-dark transition-all font-bold tracking-tight active:scale-95"
        >
          <ShoppingBasket className="w-6 h-6 text-accent" />
          <span className="text-sm">Ver Carrito (${total.toFixed(2)})</span>
        </motion.button>
      )}
    </main>
  );
};

