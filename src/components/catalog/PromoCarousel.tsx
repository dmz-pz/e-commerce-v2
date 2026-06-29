import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const PROMO_SLIDES = [
  {
    id: 1,
    title: "Semana de la Frescura",
    subtitle: "Hasta 20% de descuento en frutas y verduras seleccionadas.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop",
    cta: "Ver Frutas",
    category: "Frutas y Verduras",
    color: "bg-brand"
  },
  {
    id: 2,
    title: "Desayuno Perfecto",
    subtitle: "Lleva 2 yogures griegos y el tercero va por nuestra cuenta.",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1600&auto=format&fit=crop",
    cta: "Ver Lácteos",
    category: "Lácteos",
    color: "bg-accent"
  },
  {
    id: 3,
    title: "Masa Madre Real",
    subtitle: "Pan artesanal horneado cada mañana con fermentación natural.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1600&auto=format&fit=crop",
    cta: "Ver Panadería",
    category: "Panadería",
    color: "bg-brand-dark"
  }
];

interface PromoCarouselProps {
  onCategorySelect: (cat: string) => void;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ onCategorySelect }) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % PROMO_SLIDES.length);
  }, []);

  const prev = () => {
    setCurrent(prev => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden rounded-[2.5rem] mb-16 shadow-2xl shadow-brand/10 border border-slate-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand/80 via-brand/40 to-transparent z-10" />
          <img 
            src={PROMO_SLIDES[current].image} 
            alt={PROMO_SLIDES[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-accent font-black uppercase tracking-[0.4em] text-[10px] mb-4"
            >
              Oferta Especial
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter max-w-xl leading-none"
            >
              {PROMO_SLIDES[current].title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-sm md:text-lg max-w-md mb-8 font-medium"
            >
              {PROMO_SLIDES[current].subtitle}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => onCategorySelect(PROMO_SLIDES[current].category)}
              className="w-fit px-8 py-3 bg-white text-brand rounded-full font-bold text-sm hover:bg-accent hover:text-brand transition-all flex items-center gap-2 group shadow-xl"
            >
              {PROMO_SLIDES[current].cta}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-8 md:left-24 z-30 flex items-center gap-4">
        <button onClick={prev} className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white hover:text-brand transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={next} className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white hover:text-brand transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex gap-2 ml-4">
          {PROMO_SLIDES.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-accent' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
