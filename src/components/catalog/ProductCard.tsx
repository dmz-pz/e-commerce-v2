import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Plus, Minus, ShoppingBasket } from "lucide-react";
import { Product, Category } from "../../types";
import { useCart } from "../../context/CartContext.tsx";
import { parseAndFormatPrice } from "../../utils/formatPrice.ts";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = React.useState(false);
  const { items, addItem, updateQuantity } = useCart();
  const imageUrl = product.images?.[0]?.url;
  const cartItem = items.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  return (
    <article className="h-full">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 md:gap-4 shadow-sm hover:border-brand hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 w-full lg:h-[360px] h-full"
      >
        <Link
          to={`/product/${product.id}`}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="relative w-full aspect-square lg:aspect-video overflow-hidden bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
            {!imageError ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-200">
                <ShoppingBasket className="w-12 h-12" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Sin Imagen
                </span>
              </div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
              <div className="bg-brand/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-brand/10 uppercase tracking-wider">
                {product.subcategory?.category?.name}
              </div>
              {product.discountPrice && (
                <div className="bg-accent px-2 py-0.5 rounded-full text-[10px] font-black text-brand uppercase tracking-wider shadow-lg shadow-accent/20">
                  -
                  {Math.round(
                    (1 - product.discountPrice / product.price) * 100,
                  )}
                  %
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col flex-1 mt-3 md:mt-4 min-h-0">
            <div className="flex justify-between items-start mb-1 md:mb-2 gap-2 h-8 md:h-10 shrink-0">
              <h3 className="font-bold text-slate-900 text-[11px] md:text-sm tracking-tight leading-tight flex-1 group-hover:text-brand transition-colors line-clamp-2">
                {product.name}
              </h3>
              <div className="flex flex-col items-end leading-none shrink-0">
                {product.discountPrice ? (
                  <>
                    <span className="text-sm md:text-base font-black text-brand tracking-tighter">
                      ${parseAndFormatPrice(product.discountPrice)}
                    </span>
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-300 line-through tracking-tighter">
                      ${product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-sm md:text-base font-black text-brand tracking-tighter">
                    ${product.price}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-1.5 md:gap-2 items-center mb-2 shrink-0">
              <span className="text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium uppercase tracking-tighter">
                {product.unit}
              </span>
              <span
                className={`text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                  product.stock < 10
                    ? "bg-orange-50 text-orange-600"
                    : "bg-brand/10 text-brand"
                }`}
              >
                St: {product.stock}
              </span>
            </div>

            <div className="h-8 md:h-10 overflow-hidden">
              <p className="text-slate-400 text-[10px] md:text-xs line-clamp-2 md:line-clamp-2">
                {product.description}
              </p>
            </div>
          </div>
        </Link>

        <div className="mt-auto">
          {currentQuantity > 0 ? (
            <div className="flex items-center bg-brand rounded-lg md:rounded-xl overflow-hidden shadow-lg shadow-brand/10">
              <button
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                className="px-3 py-2 md:py-2.5 text-white hover:bg-brand-dark transition-colors border-r border-white/10"
              >
                <Minus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <span className="flex-1 text-center font-black text-white text-xs md:text-sm">
                {currentQuantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(
                    product.id,
                    Math.min(product.stock, currentQuantity + 1),
                  )
                }
                className="px-3 py-2 md:py-2.5 text-white hover:bg-brand-dark transition-colors border-l border-white/10"
                disabled={currentQuantity >= product.stock}
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(product, 1)}
              className="w-full py-2 md:py-2.5 bg-brand text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold hover:bg-brand-dark transition-all active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 shadow-lg shadow-brand/10"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">Agregar</span>
              <span className="xs:hidden">Añadir</span>
            </button>
          )}
        </div>
      </motion.div>
    </article>
  );
};
