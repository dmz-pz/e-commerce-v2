import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ChevronRight } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  icon?: React.ReactNode;
}

export const ProductSection: React.FC<ProductSectionProps> = ({ 
  title, 
  subtitle, 
  products, 
  icon
}) => {
  if (products.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/5 rounded-xl text-brand">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{title}</h2>
            {subtitle && <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>}
          </div>
        </div>
        <button className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors text-xs font-black uppercase tracking-widest group">
          Ver Todo
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex overflow-x-auto pb-8 gap-4 md:gap-6 custom-scrollbar -mx-4 px-10 md:-mx-0 md:px-0 snap-x items-stretch">
        {products.map(product => (
          <div key={product.id} className="w-[160px] md:w-[280px] shrink-0 snap-start flex">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};
