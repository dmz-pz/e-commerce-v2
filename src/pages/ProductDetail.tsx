import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Star,
  Heart,
  Share2,
  Plus,
  Minus,
  Clock,
  ShieldCheck,
  ShoppingBasket,
} from "lucide-react";
import { useGlobalCatalog } from "../context/CatalogContext.tsx";
import { useCart } from "../context/CartContext.tsx";
import { Product } from "../types/index.ts";
import { parseAndFormatPrice } from "../utils/formatPrice.ts";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useGlobalCatalog();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const found = products.find((p) => p.id === id);
      if (found) {
        setProduct(found);
      } else {
        // Opcional: navigate('/')
      }
    }
  }, [id, products, loading]);

  // 1. Guardias de carga y de objeto nulo
  if (loading || !product) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  // 2. Evaluaciones seguras (Aquí TypeScript YA SABE que product no es null)
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://via.placeholder.com/600";

  const numPrice = Number(String(product.price));
  const numDiscount = product.discountPrice
    ? Number(String(product.discountPrice))
    : null;

  const discountPercent = numDiscount
    ? Math.round((1 - numDiscount / numPrice) * 100)
    : 0;

  return (
    <main className="max-w-[1920px] mx-auto px-4 md:px-8 py-4 md:py-8">
      {/* Breadcrumbs con jerarquía relacional Prisma */}
      <nav className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 md:mb-8 overflow-x-auto no-scrollbar whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-brand transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link
          to="/"
          className="hover:text-brand transition-colors truncate max-w-[100px] md:max-w-none"
        >
          {product.subcategory?.category?.name || "Categoría"}
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="hover:text-brand transition-colors truncate max-w-[100px] md:max-w-none">
          {product.subcategory?.name || "Subcategoría"}
        </span>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-slate-900 truncate max-w-[120px] md:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Left Section: Images */}
        <div className="lg:col-span-7 xl:col-span-5 flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex md:flex-col gap-3 md:gap-4 order-2 md:order-1 overflow-x-auto no-scrollbar md:overflow-visible pb-2 md:pb-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden hover:border-brand transition-all bg-white"
              >
                {!imageError ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover opacity-50 hover:opacity-100"
                  />
                ) : (
                  <ShoppingBasket className="w-5 h-5 md:w-6 md:h-6 text-slate-100" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 order-1 md:order-2 relative aspect-square bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 flex items-center justify-center p-6 md:p-12 shadow-sm overflow-hidden group">
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 md:top-8 md:left-8 bg-accent text-brand w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-[10px] md:text-sm shadow-xl shadow-accent/20 z-10 animate-in zoom-in">
                -{discountPercent}%
              </div>
            )}
            {!imageError ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 md:gap-4 text-slate-200">
                <ShoppingBasket className="w-16 h-16 md:w-24 md:h-24" />
                <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                  No disponible
                </span>
              </div>
            )}

            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex gap-2">
              <button className="w-8 h-8 md:w-10 md:h-10 bg-white border border-slate-100 rounded-lg md:rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="w-8 h-8 md:w-10 md:h-10 bg-white border border-slate-100 rounded-lg md:rounded-xl flex items-center justify-center text-slate-400 hover:text-brand hover:border-brand/20 transition-all shadow-sm">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Info */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <div className="mb-6 md:mb-8">
            {product.brand && (
              <span className="text-[9px] md:text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-1 md:mb-2 block">
                {product.brand}
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3 md:mb-4">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 md:w-4 md:h-4 ${
                      i <= Math.round(product.rating || 5)
                        ? "text-accent fill-accent"
                        : "text-slate-200"
                    }`}
                  />
                ))}
                <span className="text-[10px] md:text-xs font-bold text-slate-400 ml-2">
                  {product.rating || "5.0"} ({product.reviewCount || 0})
                </span>
              </div>
            </div>

            <p className="text-slate-500 leading-relaxed text-xs md:text-sm mb-6 md:mb-8">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="border-t border-slate-100 pt-6 md:pt-8 mt-auto">
              <h3 className="text-[11px] md:text-sm font-black text-slate-900 uppercase tracking-widest mb-4 md:mb-6">
                Ficha Técnica
              </h3>
              <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100">
                <div className="grid grid-cols-1 gap-y-3 md:gap-y-4">
                  <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-slate-200/50">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Marca
                    </span>
                    <span className="text-[8px] md:text-[10px] font-black text-slate-700 uppercase tracking-wider">
                      {product.brand || "Genérico"}
                    </span>
                  </div>
                  {product.specifications &&
                    Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center py-1.5 md:py-2 border-b border-slate-200/50 last:border-0"
                        >
                          <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            {key}
                          </span>
                          <span className="text-[8px] md:text-[10px] font-black text-slate-700 uppercase tracking-wider">
                            {String(value)}
                          </span>
                        </div>
                      ),
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Purchase Box */}
        <div className="lg:col-span-12 xl:col-span-3 relative">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 md:p-8 xl:sticky xl:top-32">
            <div className="mb-6 md:mb-8">
              {product.discountPrice ? (
                <div className="flex items-baseline gap-2 md:gap-3">
                  <span className="text-3xl md:text-4xl font-black text-brand tracking-tighter">
                    ${parseAndFormatPrice(product.discountPrice)}
                  </span>
                  <span className="text-base md:text-lg font-bold text-slate-300 line-through tracking-tighter">
                    ${parseAndFormatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl md:text-4xl font-black text-brand tracking-tighter">
                  ${parseAndFormatPrice(product.price)}
                </span>
              )}
              <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 md:mt-2">
                I.V.A Incluido • Precio por {product.unit}
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center bg-slate-50 rounded-xl md:rounded-2xl p-1.5 md:p-2 border border-slate-100">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-slate-400 hover:text-brand"
                >
                  <Minus className="w-3 h-3 md:w-4 md:h-4" />
                </button>
                <span className="flex-1 text-center font-black text-sm md:text-base text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-slate-400 hover:text-brand"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>

              <button
                onClick={() => addItem(product, quantity)}
                disabled={product.stock === 0}
                className="w-full py-4 md:py-5 bg-brand text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale cursor-pointer"
              >
                {product.stock > 0 ? "Agregar al carrito" : "Agotado"}
              </button>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4 pt-2 md:pt-4">
                <div className="flex items-center gap-2 md:gap-3 text-slate-600">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-brand/5 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-brand" />
                  </div>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">
                    Express en <span className="text-brand">35 min</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-slate-600">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-brand/5 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-brand" />
                  </div>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">
                    Garantía Minegocio
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products Row */}
      <div className="mt-16 md:mt-24">
        <div className="flex items-center justify-between mb-6 md:mb-8 px-1">
          <div className="flex items-center gap-2 md:gap-3">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-brand" />
            <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Productos relacionados
            </h2>
          </div>
          <Link
            to="/"
            className="text-[8px] md:text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
          >
            Ver todo
          </Link>
        </div>
        <div className="flex md:grid overflow-x-auto md:overflow-visible pb-8 md:pb-0 gap-4 md:gap-6 no-scrollbar -mx-2 px-2 md:-mx-0 md:px-0 snap-x md:snap-none md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {products
            .filter(
              (p) =>
                p.subcategoryId === product.subcategoryId &&
                p.id !== product.id,
            )
            .slice(0, 5)
            .map((p) => {
              const relImg =
                p.images && p.images.length > 0
                  ? p.images[0].url
                  : "https://via.placeholder.com/300";

              return (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="block group w-[160px] md:w-auto shrink-0 snap-start"
                >
                  <div className="aspect-square bg-white rounded-2xl md:rounded-3xl border border-slate-100 mb-3 md:mb-4 overflow-hidden p-4 md:p-6 flex items-center justify-center group-hover:border-brand transition-all">
                    <img
                      src={relImg}
                      alt={p.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-tight line-clamp-1 mb-1">
                    {p.name}
                  </h4>
                  <p className="text-brand font-black text-xs md:text-sm">
                    ${parseAndFormatPrice(p.price)}
                  </p>
                </Link>
              );
            })}
        </div>
      </div>
    </main>
  );
};
