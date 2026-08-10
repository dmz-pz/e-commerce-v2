import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Product, Category, Subcategory } from "../types/index.ts";
import { useCart } from "./CartContext.tsx";
import { useUser } from "./UserContext.tsx";
import { productService } from "../services/productService.ts";
import { categoryService } from "../services/categoryService.ts";
import { orderService } from "../services/orderService.ts";

interface CatalogContextType {
  products: Product[];
  categories: Category[];
  selectedCategory: string; // 'all' o ID/Nombre de categoría
  setSelectedCategory: (cat: string) => void;
  selectedSubcategory: string; // 'all' o ID/Nombre de subcategoría
  setSelectedSubcategory: (sub: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  subcategories: Subcategory[];
  filteredProducts: Product[];
  recommendedProducts: Product[];
  discountedProducts: Product[];
  bestSellers: Product[];
  isCategoriesOpen: boolean;
  setIsCategoriesOpen: (open: boolean) => void;
  showCart: boolean;
  setShowCart: (show: boolean) => void;
  showCategoriesModal: boolean;
  setShowCategoriesModal: (show: boolean) => void;
  checkoutLoading: boolean;
  handleCheckout: () => Promise<void>;
  // Server-side pagination states & controls
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  sortBy: "relevance" | "price_asc" | "price_desc" | "name_asc";
  setSortBy: (sort: "relevance" | "price_asc" | "price_desc" | "name_asc") => void;
  totalProducts: number;
  totalPages: number;
  loadMore: () => void;
  isAppending: boolean;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAppending, setIsAppending] = useState(false);
  const isAppendingRef = React.useRef(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Estados de paginación server-side
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "name_asc">("relevance");
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para secciones destacadas de la portada (limitadas a 10 productos por sección)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  const { items, clearCart } = useCart();
  const { user } = useUser();

  // Resetear a página 1 al cambiar filtros principales
  useEffect(() => {
    isAppendingRef.current = false;
    setPage(1);
  }, [selectedCategory, selectedSubcategory, searchQuery, limit, sortBy]);

  // Resetear la subcategoría seleccionada al cambiar de categoría principal
  useEffect(() => {
    setSelectedSubcategory("all");
  }, [selectedCategory]);

  // 1. CARGA DE CATEGORÍAS Y PRODUCTOS DESTACADOS PARA LA PORTADA (MÁX 10 POR SECCIÓN)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, recRes, discRes] = await Promise.all([
          categoryService.getCategories(),
          productService.getProducts({ isRecommended: true, limit: 10 }),
          productService.getProducts({ hasDiscount: true, limit: 10 }),
        ]);
        setCategories(categoriesData);

        let finalRecommended = recRes.items || [];
        if (finalRecommended.length === 0) {
          // Fallback a los primeros 10 productos activos
          const fallbackRec = await productService.getProducts({ limit: 10 });
          finalRecommended = fallbackRec.items || [];
        }
        setRecommendedProducts(finalRecommended);

        let finalDiscounted = discRes.items || [];
        if (finalDiscounted.length === 0) {
          // Fallback a los 10 productos más económicos
          const fallbackDisc = await productService.getProducts({ sortBy: "price_asc", limit: 10 });
          finalDiscounted = fallbackDisc.items || [];
        }
        setDiscountedProducts(finalDiscounted);

        setBestSellers(finalRecommended.slice(0, 8));
      } catch (err) {
        console.error("Error al cargar categorías y destacados de portada:", err);
      }
    };

    fetchInitialData();
  }, []);

  // 2. CARGA PAGINADA SERVER-SIDE DE PRODUCTOS SEGÚN FILTROS Y NAVEGACIÓN
  const fetchProducts = useCallback(async () => {
    if (isAppendingRef.current) {
      setIsAppending(true);
    } else {
      setLoading(true);
    }
    try {
      // Determinar ID real de categoría o subcategoría si no es 'all'
      let catId: string | undefined;
      if (selectedCategory !== "all") {
        const foundCat = categories.find(
          (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        catId = foundCat?.id || selectedCategory;
      }

      let subCatId: string | undefined;
      if (selectedSubcategory !== "all") {
        const foundSub = categories
          .flatMap((c) => c.subcategories || [])
          .find((s) => s.id === selectedSubcategory || s.name.toLowerCase() === selectedSubcategory.toLowerCase());
        subCatId = foundSub?.id || selectedSubcategory;
      }

      const res = await productService.getProducts({
        page,
        limit,
        categoryId: catId,
        subcategoryId: subCatId,
        search: searchQuery.trim() || undefined,
        sortBy,
      });

      if (isAppendingRef.current) {
        setProducts((prev) => {
          const newItems = res.items || [];
          const uniqueIds = new Set(prev.map(p => p.id));
          const toAdd = newItems.filter(p => !uniqueIds.has(p.id));
          return [...prev, ...toAdd];
        });
        isAppendingRef.current = false;
      } else {
        setProducts(res.items || []);
      }
      setTotalProducts(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Error al obtener catálogo paginado:", err);
    } finally {
      setLoading(false);
      setIsAppending(false);
    }
  }, [page, limit, selectedCategory, selectedSubcategory, searchQuery, sortBy, categories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. BÚSQUEDA RÁPIDA POR ESCÁNER INDUSTRIAL (Código de barras)
  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    const isBarcode = /^\d{8,14}$/.test(cleanQuery);
    if (isBarcode) {
      productService
        .getProductByBarcode(cleanQuery)
        .then((product) => {
          if (product) {
            setProducts([product]);
            setTotalProducts(1);
            setTotalPages(1);
          }
        })
        .catch(() => {});
    }
  }, [searchQuery]);

  // 4. SUBCATEGORÍAS DINÁMICAS BASADAS EN LA CATEGORÍA SELECCIONADA
  const subcategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    const activeCategory = categories.find(
      (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
    return activeCategory?.subcategories || [];
  }, [categories, selectedCategory]);

  const loadMore = useCallback(() => {
    if (loading || isAppending || page >= totalPages) return;
    isAppendingRef.current = true;
    setPage((p) => p + 1);
  }, [loading, isAppending, page, totalPages]);

  // 5. PROCESAMIENTO DEL CHECKOUT
  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!user) {
      alert("Debes iniciar sesión para realizar un pedido.");
      return;
    }
    setCheckoutLoading(true);
    try {
      await orderService.createOrder({
        fulfillmentMethod: "DELIVERY",
        items: items.map((item) => ({
          productId: item.productId,
          requestedQuantity: item.quantity,
        })),
      });

      const customerDisplayName = user.firstName || user.name || "";
      alert(
        `¡Gracias ${customerDisplayName}! Pedido realizado con éxito. El personal ya está preparando tu compra.`,
      );
      clearCart();
      setShowCart(false);
      fetchProducts();
    } catch (error) {
      const e = error as Error;
      alert(e.message || "Error al procesar el pedido");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        searchQuery,
        setSearchQuery,
        loading,
        subcategories,
        filteredProducts: products, // En servidor, los productos devueltos son los ya filtrados
        recommendedProducts,
        discountedProducts,
        bestSellers,
        isCategoriesOpen,
        setIsCategoriesOpen,
        showCart,
        setShowCart,
        showCategoriesModal,
        setShowCategoriesModal,
        checkoutLoading,
        handleCheckout,
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
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useGlobalCatalog = () => {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error("useGlobalCatalog must be used within a CatalogProvider");
  }
  return context;
};
