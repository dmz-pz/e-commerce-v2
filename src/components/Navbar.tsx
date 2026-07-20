import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  User,
  Search,
  ShoppingBasket,
  ChevronDown,
  ShieldAlert,
  Bike,
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Logo } from "./Logo.tsx";
import { useCart } from "../context/CartContext.tsx";
import { useGlobalCatalog } from "../context/CatalogContext.tsx";
import { useUser } from "../context/UserContext.tsx";
import { Category } from "../types/index.ts";

export const Navbar: React.FC = () => {
  const { items } = useCart();
  const {
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    setShowCart,
  } = useGlobalCatalog();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;

    // Al llegar arriba del todo, siempre mostrar
    if (latest < 50) {
      setIsVisible(true);
      return;
    }

    // Solo ocultar si el scroll es hacia abajo y ha superado un umbral de 10px
    if (diff > 10 && latest > 150) {
      setIsVisible(false);
    }
    // Solo mostrar si el scroll es hacia arriba y ha superado un umbral de 10px
    else if (diff < -10) {
      setIsVisible(true);
    }
  });

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isStaffOrAdmin =
    user &&
    (user.role === "staff" ||
      user.role === "picker" ||
      user.role === "admin" ||
      user.role === "delivery");

  if (isStaffOrAdmin) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">
          <nav className="bg-brand md:bg-white border-b border-white/10 md:border-slate-100 h-16 md:h-20 flex items-center shadow-sm relative z-20">
            <div className="max-w-[1920px] mx-auto px-4 md:px-8 w-full flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center gap-2 md:gap-3">
                <Logo className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" />
                <span className="font-black text-base md:text-xl tracking-tight text-white md:text-brand uppercase">
                  Mi
                  <span className="text-accent underline decoration-white md:decoration-brand underline-offset-4">
                    negocio
                  </span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[9px] border border-slate-200">
                  OS V3.0
                </span>
              </div>

              {/* Badge indicativo central de rol / módulo */}
              <div className="hidden md:flex items-center gap-2">
                {user.role === "admin" ? (
                  <span className="px-4 py-1.5 rounded-full bg-red-50 md:bg-red-500/10 text-red-600 md:text-red-700 font-extrabold uppercase tracking-widest text-[9px] md:text-[10px] border border-red-200/50 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    Panel de Administración
                  </span>
                ) : user.role === "delivery" ? (
                  <span className="px-4 py-1.5 rounded-full bg-blue-50 md:bg-blue-500/10 text-blue-600 md:text-blue-700 font-extrabold uppercase tracking-widest text-[9px] md:text-[10px] border border-blue-200/50 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-blue-600" />
                    Módulo de Delivery (Motorizado)
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-emerald-50 md:bg-emerald-500/10 text-emerald-600 md:text-emerald-700 font-extrabold uppercase tracking-widest text-[9px] md:text-[10px] border border-emerald-200/50 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    Módulo de Operaciones (Picker)
                  </span>
                )}
              </div>

              {/* Acciones derecha */}
              <div className="flex items-center gap-3">
                {user.role === "admin" && (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin"
                      className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${
                        location.pathname === "/admin"
                          ? "bg-white/20 text-white md:bg-brand/10 md:text-brand"
                          : "text-white/75 md:text-slate-500 hover:text-white md:hover:text-brand"
                      }`}
                    >
                      Admin
                    </Link>
                    <Link
                      to="/staff"
                      className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${
                        location.pathname === "/staff"
                          ? "bg-white/20 text-white md:bg-brand/10 md:text-brand"
                          : "text-white/75 md:text-slate-500 hover:text-white md:hover:text-brand"
                      }`}
                    >
                      Operaciones
                    </Link>
                    <Link
                      to="/delivery"
                      className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${
                        location.pathname === "/delivery"
                          ? "bg-white/20 text-white md:bg-brand/10 md:text-brand"
                          : "text-white/75 md:text-slate-500 hover:text-white md:hover:text-brand"
                      }`}
                    >
                      Repartos
                    </Link>
                  </div>
                )}

                {user.role === "delivery" && (
                  <Link
                    to="/delivery"
                    className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/20 text-white md:bg-brand/10 md:text-brand border border-white/10 md:border-brand/10 transition-colors`}
                  >
                    Repartos Activos (Carlos)
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="w-10 h-10 md:w-12 md:h-12 bg-white/10 md:bg-slate-50 border border-white/20 md:border-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center hover:border-brand transition-all group lg:mr-2"
                  title="Mi Perfil"
                >
                  <User className="w-5 h-5 text-white/70 md:text-brand group-hover:text-brand" />
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <div className="h-16 md:h-20 pointer-events-none shrink-0" />
      </>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        {/* Main Navbar - Desktop & Mobile Header */}
        <nav className="bg-brand md:bg-white border-b border-white/10 md:border-slate-100 min-h-[64px] md:h-20 flex items-center shadow-sm relative z-20">
          <div className="max-w-[1920px] mx-auto px-4 md:px-8 w-full">
            <div className="flex justify-between items-center gap-4 md:gap-8">
              {/* Mobile User Icon / Desktop Logo */}
              <div className="md:hidden">
                <Link
                  to={user ? "/profile" : "/login"}
                  className="w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center"
                >
                  <User className="w-5 h-5 text-white/70" />
                </Link>
              </div>

              <Link
                to="/"
                className="flex items-center gap-2 md:gap-3 shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
              >
                <Logo className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" />
                <span className="font-black text-lg md:text-2xl tracking-tight text-white md:text-brand uppercase hidden sm:block">
                  Mi
                  <span className="text-accent underline decoration-white md:decoration-brand underline-offset-4">
                    negocio
                  </span>
                </span>
              </Link>

              {/* Desktop Global Search - Hidden on Mobile */}
              <div className="hidden md:flex flex-1 max-w-3xl">
                <div className="h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center px-6 gap-4 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all w-full">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="¿Buscas algo en específico? (leche, pan, jabón...)"
                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="bg-brand text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-colors">
                    Buscar
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <div className="hidden lg:flex items-center gap-6 mr-4">
                  {user &&
                    (user.role === "staff" ||
                      user.role === "picker" ||
                      user.role === "admin") && (
                      <Link
                        to="/staff"
                        className="text-[10px] font-black text-slate-400 hover:text-brand transition-colors uppercase tracking-widest flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        Operaciones
                      </Link>
                    )}
                  {user &&
                    (user.role === "delivery" || user.role === "admin") && (
                      <Link
                        to="/delivery"
                        className="text-[10px] font-black text-slate-400 hover:text-brand transition-colors uppercase tracking-widest flex items-center gap-2"
                      >
                        <Bike className="w-4 h-4" />
                        Reparto
                      </Link>
                    )}
                  {user && user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="text-[10px] font-black text-slate-400 hover:text-brand transition-colors uppercase tracking-widest flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Administración
                    </Link>
                  )}
                </div>

                <button
                  onClick={() => setShowCart(true)}
                  className="relative w-10 h-10 md:w-12 md:h-12 bg-white/10 md:bg-slate-50 border border-white/20 md:border-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center transition-all md:hover:bg-brand group md:hover:border-brand"
                >
                  <ShoppingCart className="w-6 h-6 md:w-5 md:h-5 text-white/70 md:text-slate-400 md:group-hover:text-white transition-colors" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 md:-top-1 md:-right-1 bg-accent text-brand text-[9px] md:text-[10px] w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm animate-in zoom-in">
                      {itemCount}
                    </span>
                  )}
                </button>

                <Link
                  to={user ? "/profile" : "/login"}
                  className="hidden md:flex w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl items-center justify-center overflow-hidden hover:border-brand transition-all group"
                >
                  <User
                    className={`w-5 h-5 transition-colors ${user ? "text-brand" : "text-slate-400"} group-hover:text-brand`}
                  />
                </Link>
              </div>
            </div>

            {/* Mobile Search Bar - Visible only on Mobile */}
            <div className="md:hidden pb-4 mt-2">
              <div className="h-11 bg-white/10 border border-white/20 rounded-full flex items-center px-4 gap-3">
                <Search className="w-4 h-4 text-white/50 shrink-0" />
                <input
                  type="text"
                  placeholder="Busca aquí tu producto"
                  className="bg-transparent border-none outline-none w-full text-xs font-bold text-white placeholder:text-white/30 placeholder:font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Category Navbar - Hides behind Main Nav */}
        <div className="hidden md:block overflow-hidden relative z-10 h-12">
          <motion.nav
            initial={false}
            animate={{
              y: isVisible ? 0 : -48,
              opacity: isVisible ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="bg-brand h-full items-center shadow-md"
          >
            <div className="max-w-[1920px] mx-auto px-4 md:px-8 w-full h-full flex items-center">
              <div className="flex items-center justify-center gap-2 w-full">
                <div className="hidden lg:flex items-center gap-1 bg-white/10 px-4 py-1.5 rounded-lg border border-white/10 mr-4 shrink-0 cursor-pointer hover:bg-white/20 transition-colors">
                  <ShoppingBasket className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">
                    Categorías
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/50" />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar justify-start md:justify-center">
                  {categories.map((cat) => {
                    // Manejo seguro si el elemento es la cadena 'all' o un objeto Category
                    const isAll = typeof cat === "string" && cat === "all";
                    const categoryId = isAll ? "all" : (cat as Category).id;
                    const categoryName = isAll
                      ? "Todas las categorías"
                      : (cat as Category).name;

                    // Verificación de selección (compara por ID o por nombre si selectedCategory es string)
                    const isSelected =
                      selectedCategory === categoryId ||
                      selectedCategory === categoryName;

                    return (
                      <button
                        key={categoryId}
                        onClick={() => setSelectedCategory(categoryId)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand text-white shadow-md shadow-brand/20"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {categoryName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.nav>
        </div>
      </header>

      {/* Spacer to prevent layout shift - Matches initial header height exactly */}
      <div className="h-[124px] md:h-[128px] pointer-events-none shrink-0" />
    </>
  );
};
