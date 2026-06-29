import React from 'react';
import { ChevronRight } from 'lucide-react';

export const BentoPromos: React.FC = () => {
  return (
    <div className="md:hidden grid grid-cols-2 gap-3 mb-8">
      {/* Big Promo */}
      <div className="row-span-2 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col relative overflow-hidden group">
        <div className="bg-accent text-brand self-start px-2 py-1 rounded-lg text-[9px] font-black uppercase mb-3">Hasta 35%</div>
        <h3 className="text-sm font-black text-slate-900 leading-tight mb-2 pr-4">Hasta 35% Dcto. en tu Canasta Básica</h3>
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop" 
          alt="" 
          className="w-full aspect-[4/5] object-cover rounded-xl mt-auto transition-transform group-hover:scale-110"
        />
        <button className="absolute top-4 right-4 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Small Promo 1 */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between gap-2 items-start group">
        <div className="flex flex-col flex-1">
          <div className="bg-accent text-brand self-start px-2 py-0.5 rounded-lg text-[8px] font-black uppercase mb-2">20%</div>
          <h3 className="text-[11px] font-black text-slate-900 leading-tight">20% Dcto. en Dulces y Snacks</h3>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1581798459219-318e76aecc7b?q=80&w=200&auto=format&fit=crop" 
          alt="" 
          className="w-12 h-12 object-cover rounded-lg group-hover:rotate-12 transition-transform"
        />
      </div>

      {/* Small Promo 2 */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between gap-2 items-start group">
        <div className="flex flex-col flex-1">
          <div className="bg-accent text-brand self-start px-2 py-0.5 rounded-lg text-[8px] font-black uppercase mb-2">35%</div>
          <h3 className="text-[11px] font-black text-slate-900 leading-tight">Canjea tus cupones de Cuidado de la Piel</h3>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&auto=format&fit=crop" 
          alt="" 
          className="w-12 h-12 object-cover rounded-lg group-hover:rotate-12 transition-transform"
        />
      </div>
    </div>
  );
};
