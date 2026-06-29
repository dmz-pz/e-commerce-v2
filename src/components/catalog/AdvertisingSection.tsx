import React from 'react';
import { motion } from 'motion/react';
import { Award, ChefHat, Sparkles, ArrowRight, Percent, ShieldCheck } from 'lucide-react';

export const FidelityBanner: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-16 px-2"
      aria-label="Programa de Fidelidad"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand via-brand-dark to-[#001f5c] p-8 md:p-12 text-white shadow-xl shadow-brand/10">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent font-black uppercase tracking-[0.2em] text-[9px] mb-6">
              <Award className="w-3.5 h-3.5 fill-accent" /> Club de Puntos Minegocio
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tighter">
              Tus compras diarias ahora <span className="text-accent">valen el doble</span>
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-lg font-medium leading-relaxed">
              Únete gratis hoy mismo. Acumula el 5% de todas tus compras en puntos de canje instantáneo y accede a envíos rápidos prioritarios sin costo mínimo.
            </p>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap gap-6 mt-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-accent">
                  <Percent className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white/90">Descuentos directos en caja</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-accent">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white/90">Socio VIP prioritario</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-8 py-4.5 bg-accent text-brand rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-accent/15 flex items-center justify-center gap-2"
            >
              Unirme al Club
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <button className="w-full sm:w-auto px-8 py-4.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
              Cómo funciona
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export const RecipesBanner: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-16 px-2"
      aria-label="Inspiración y Recetas"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540340061722-9293d5163008?q=80&w=1600&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-35 scale-105 hover:scale-100 transition-transform duration-[4000ms] ease-out pointer-events-none"
            alt="Ingredientes premium y cocina"
          />
          {/* Custom vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-14 max-w-xl md:max-w-2xl flex flex-col justify-center min-h-[380px]">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-black uppercase tracking-[0.2em] text-[9px] mb-6 w-fit">
            <ChefHat className="w-3.5 h-3.5 text-accent" /> Recetario Semanal
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tighter">
            Prepara platos deliciosos <br />
            <span className="text-accent font-black">con productos locales</span>
          </h2>
          <p className="text-white/85 text-sm md:text-base mb-8 font-medium leading-relaxed max-w-lg">
            Descubre recetas rápidas seleccionadas por chefs locales que optimizan el uso de las verduras frescas y carnes de nuestra temporada, ahorrando tiempo y dinero.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4.5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-brand transition-all flex items-center justify-center gap-2"
            >
              Ver Recetas Semanales
              <ArrowRight className="w-4 h-4 text-brand" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export const EcoFreshBanner: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-16 px-2"
      aria-label="Frescura orgánica garantizada"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#eef6ec] border border-green-100 p-8 md:p-12 text-slate-800 shadow-sm text-center md:text-left">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 bg-green-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 font-black uppercase tracking-widest text-[9px] mb-4">
              <Sparkles className="w-3.5 h-3.5 fill-green-600 text-green-600" /> Directo del campo a tu hogar
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight mb-2">
              Frutas y Verduras 100% Orgánicas
            </h3>
            <p className="text-emerald-900/60 text-sm md:text-base font-medium">
              Sostenemos un vínculo directo con productores locales de la región para entregarte frescura absoluta en menos de 2 horas. Apoya el comercio local hoy.
            </p>
          </div>
          <div className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md"
            >
              Explorar Orgánicos
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
