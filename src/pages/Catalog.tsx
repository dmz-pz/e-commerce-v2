import React, { useEffect, useRef } from "react";
import {
  ShoppingBasket,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalCatalog } from "../context/CatalogContext.tsx";
import { useCart } from "../context/CartContext.tsx";
import { PromoCarousel } from "../components/catalog/PromoCarousel.tsx";
import { ProductCard } from "../components/catalog/ProductCard.tsx";
import {
  FidelityBanner,
  RecipesBanner,
  EcoFreshBanner,
} from "../components/catalog/AdvertisingSection.tsx";
import { ProductSection } from "../components/catalog/ProductSection.tsx";
import { SubcategorySidebar } from "../components/catalog/SubcategorySidebar.tsx";
import { BentoPromos } from "../components/catalog/BentoPromos.tsx";
import { PaginationBar } from "../components/catalog/PaginationBar.tsx";

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
    loadMore,
    isAppending,
  } = useGlobalCatalog();

  const { items, total } = useCart();

  const observerTarget = useRef<HTMLDivElement>(null);

  // Mantener el scroll del tab seleccionado centrado en móviles
  useEffect(() => {
    const activeTab = document.getElementById("active-mobile-tab");
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedSubcategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const isGeneralCatalog = selectedCategory === "all" && searchQuery === "";

  return (
    <main className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
      {/* Mobile Special Content */}
      {selectedCategory === "all" && searchQuery === "" && (
        <div className="md:hidden">
          <BentoPromos />
        </div>
      )}

      <header className="hidden md:flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-brand font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">
            Bienvenido a Supermercado
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            Tu Super,
            <br />
            <span className="text-brand">Más Fresco.</span>
          </h1>
        </div>
        <div className="hidden lg:flex gap-8 items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
              Entrega Promedio
            </span>
            <span className="block text-xl font-bold text-brand tracking-tight">
              25 - 40 min
            </span>
          </div>
          <div className="w-px h-10 bg-slate-100" />
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
              Costo de Envío
            </span>
            <span className="block text-xl font-bold text-accent tracking-tight">
              ¡Gratis!
            </span>
          </div>
        </div>
      </header>

      {/* Portada Principal: Carrusel y Secciones Destacadas (Máx 10 por bloque) */}
      {selectedCategory === "all" && searchQuery === "" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="hidden md:block mb-12">
            <PromoCarousel onCategorySelect={setSelectedCategory} />
          </div>

          {loading && !filteredProducts.length ? (
            <div className="flex items-center justify-center h-[40vh] w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Vista de Catálogo por Categoría / Subcategoría o Búsqueda */}
      {!isGeneralCatalog && (
        <div className="mt-8 flex flex-col lg:flex-row gap-10">
          <SubcategorySidebar />

          <div className="flex-1 min-w-0">
            {/* Contenedor Sticky para Filtros y Tabs Móviles */}
            <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md md:static md:bg-transparent pb-2 -mx-4 px-4 md:mx-0 md:px-0 pt-2 -mt-2">
              {/* Mobile Subcategory Chips (Tabs rediseñados) */}
              {selectedCategory !== "all" && subcategories.length > 0 && (
                <div className="relative lg:hidden mb-2">
                  <div className="flex overflow-x-auto no-scrollbar gap-6 px-2 border-b border-slate-100 bg-transparent pt-2">
                    {subcategories.map((sub) => {
                      const subName = typeof sub === "string" ? sub : sub.name;
                      const subId = typeof sub === "string" ? sub : sub.id;
                      const isSelected = selectedSubcategory === subName || selectedSubcategory === subId;
                      return (
                        <button
                          key={subId}
                          id={isSelected ? "active-mobile-tab" : undefined}
                          onClick={() => setSelectedSubcategory(subName)}
                          className={`relative pb-3 text-sm font-bold whitespace-nowrap transition-colors ${isSelected ? "text-brand" : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                          {subName === "all" ? "Ver todo" : subName}
                          {isSelected && (
                            <motion.div
                              layoutId="activeMobileTab"
                              className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Gradiente derecho para sugerir scroll (Affordance) */}
                  <div className="absolute right-[-16px] top-0 bottom-[1px] w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
                </div>
              )}

              {/* Toolbar: Comprar por (Ordenamiento) + Artículos por página */}
              <div className="mb-2 md:mb-6 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-center w-full gap-2 md:gap-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="sort-select"
                      className="text-xs font-bold text-slate-500"
                    >
                      Ordenar por
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "relevance" | "price_asc" | "price_desc" | "name_asc")}
                      className="h-9 md:h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 md:px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
                    >
                      <option value="relevance">Relevancia</option>
                      <option value="price_asc">Menor Precio</option>
                      <option value="price_desc">Mayor Precio</option>
                      <option value="name_asc">Nombre (A-Z)</option>
                    </select>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <label
                      htmlFor="top-limit-select"
                      className="hidden sm:block text-xs font-bold text-slate-500"
                    >
                      Mostrar
                    </label>
                    <select
                      id="top-limit-select"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="h-9 md:h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 md:px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
                    >
                      <option value={12}>12 pág.</option>
                      <option value={24}>24 pág.</option>
                      <option value={50}>50 pág.</option>
                      <option value={100}>100 pág.</option>
                    </select>
                  </div>
                </div>
              </div>
            </div> {/* Fin contenedor sticky */}

            {/* Grilla de productos */}
            <div className="w-full">
              <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 md:gap-6 items-stretch pb-8 md:pb-0 px-2 md:px-0">
                <AnimatePresence mode="popLayout">
                  {loading && !filteredProducts.length ? (
                    <motion.div
                      key="loading-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full w-full py-24 flex justify-center"
                    >
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                    </motion.div>
                  ) : filteredProducts.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full w-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200"
                    >
                      <ShoppingBasket className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs px-4">
                        Sin resultados • Intenta otra búsqueda o subcategoría
                      </p>
                    </motion.div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="w-full flex"
                      >
                        <ProductCard product={product} />
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Infinite Scroll trigger area (solo para móviles) */}
              {page < totalPages && (
                <div ref={observerTarget} className="md:hidden w-full h-20 flex items-center justify-center">
                  {isAppending ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando...</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Barra de Paginación Inferior (Oculta en móviles porque usa scroll infinito) */}
            <div className="hidden md:block">
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
