import React, { useState } from 'react';
import { ShoppingBasket, Star, Tag, TrendingUp, Sparkles, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalCatalog } from '../context/CatalogContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { PromoCarousel } from '../components/catalog/PromoCarousel.tsx';
import { ProductCard } from '../components/catalog/ProductCard.tsx';
import { FidelityBanner, RecipesBanner, EcoFreshBanner } from '../components/catalog/AdvertisingSection.tsx';
import { CartDrawer } from '../components/catalog/CartDrawer.tsx';
import { ProductSection } from '../components/catalog/ProductSection.tsx';
import { SubcategorySidebar } from '../components/catalog/SubcategorySidebar.tsx';
import { BentoPromos } from '../components/catalog/BentoPromos.tsx';
import { CategoryCircularNav } from '../components/catalog/CategoryCircularNav.tsx';

export const Catalog: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    subcategories,
    searchQuery,
    checkoutLoading,
    loading,
    showCart,
    setShowCart,
    filteredProducts,
    recommendedProducts,
    discountedProducts,
    bestSellers,
    handleCheckout
  } = useGlobalCatalog();

  const { items, total, removeItem, addItem } = useCart();
  const [displayLimit, setDisplayLimit] = useState(20);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
    </div>
  );

  const isGeneralCatalog = selectedCategory === 'all' && searchQuery === '';
  const productsToDisplay = isGeneralCatalog 
    ? filteredProducts.slice(0, displayLimit) 
    : filteredProducts;

  const hasMoreProducts = isGeneralCatalog && filteredProducts.length > displayLimit;

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
          <span className="text-brand font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Bienvenido a Minegocio</span>
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
      
      {/* Promotional content - Desktop Only Carousel */}
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

      {!isGeneralCatalog && (
        <div className="mt-16 flex flex-col lg:flex-row gap-12">
          <SubcategorySidebar />

          <div className="flex-1">
            <div className="mb-8 px-2">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-brand" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {selectedCategory === 'all' && searchQuery === '' ? 'Todo el Catálogo' : 
                   searchQuery !== '' ? `Buscando "${searchQuery}"` : `Explorando ${selectedCategory}`}
                </h2>
              </div>

              {/* Mobile Subcategory Chips */}
              {selectedCategory !== 'all' && subcategories.length > 1 && (
                <div className="flex lg:hidden overflow-x-auto custom-scrollbar gap-2 mb-8 -mx-4 px-10">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                        selectedSubcategory === sub
                          ? 'bg-brand text-white shadow-lg shadow-brand/20'
                          : 'bg-white text-slate-400 border border-slate-100 hover:border-brand/30'
                      }`}
                    >
                      {sub === 'all' ? 'Ver todo' : sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full">
              <div className="flex md:grid overflow-x-auto md:overflow-visible pb-8 md:pb-0 gap-4 md:gap-8 items-stretch custom-scrollbar -mx-4 px-10 md:-mx-0 md:px-0 snap-x md:snap-none md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                <AnimatePresence mode='popLayout'>
                  {filteredProducts.length === 0 && (
                    <motion.div 
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full w-full py-32 md:py-48 text-center bg-white rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-200"
                    >
                      <ShoppingBasket className="w-16 h-16 md:w-20 md:h-20 text-slate-100 mx-auto mb-6 md:mb-8" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-sm px-4">Sin resultados • Intenta otra búsqueda</p>
                    </motion.div>
                  )}

                  {/* In-grid products */}
                  {productsToDisplay.length > 0 && productsToDisplay.map((product) => (
                    <div key={product.id} className="w-[160px] md:w-full shrink-0 snap-start flex">
                      <ProductCard product={product} />
                    </div>
                  ))}

                  {/* Load More Button */}
                  {hasMoreProducts && (
                    <div className="col-span-full flex justify-center py-12">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDisplayLimit(prev => prev + 20)}
                        className="group flex flex-col items-center gap-3 bg-white border border-slate-100 hover:border-brand/30 px-12 py-6 rounded-3xl shadow-sm hover:shadow-xl transition-all"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                          <ChevronDown className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand transition-colors">
                          Cargar más productos
                        </span>
                      </motion.button>
                    </div>
                  )}
                  
                  {/* Mobile "Ver Todo" placeholder at the end if searching */}
                  {productsToDisplay.length > 0 && !hasMoreProducts && (
                    <div className="md:hidden w-32 shrink-0 flex items-center justify-center snap-start">
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Ver<br/>Más</span>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
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

