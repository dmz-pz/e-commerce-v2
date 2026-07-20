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
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { items, clearCart } = useCart();
  const { user } = useUser();

  // 1. CARGA INICIAL: PRODUCTOS Y CATEGORÍAS EN PARALELO
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts({ includeInactive: false }),
        categoryService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching catalog data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Resetear la subcategoría seleccionada al cambiar de categoría principal
  useEffect(() => {
    setSelectedSubcategory("all");
  }, [selectedCategory]);

  // 2. BÚSQUEDA RÁPIDA POR ESCÁNER INDUSTRIAL
  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    // Detecta patrón de código de barras (8 a 14 dígitos)
    const isBarcode = /^\d{8,14}$/.test(cleanQuery);
    if (isBarcode) {
      productService
        .getProductByBarcode(cleanQuery)
        .then((product) => {
          if (product) {
            setProducts([product]);
          }
        })
        .catch(() => {
          // Si no existe coincidencia exacta por código de barras, mantiene la lista general
        });
    }
  }, [searchQuery]);

  // 3. SUBCATEGORÍAS DINÁMICAS BASADAS EN LA CATEGORÍA SELECCIONADA
  const subcategories = useMemo(() => {
    if (selectedCategory === "all") return [];

    // Busca por ID o por Nombre la categoría activa
    const activeCategory = categories.find(
      (c) =>
        c.id === selectedCategory ||
        c.name.toLowerCase() === selectedCategory.toLowerCase(),
    );

    return activeCategory?.subcategories || [];
  }, [categories, selectedCategory]);

  // 4. FILTRADO MEMOIZADO DE PRODUCTOS
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const query = searchQuery.toLowerCase().trim();

      // Coincidencia por categoría
      const matchesCategory =
        selectedCategory === "all" ||
        p.subcategory?.categoryId === selectedCategory ||
        p.subcategory?.category?.name.toLowerCase() ===
          selectedCategory.toLowerCase();

      // Coincidencia por subcategoría
      const matchesSubcategory =
        selectedSubcategory === "all" ||
        p.subcategoryId === selectedSubcategory ||
        p.subcategory?.name.toLowerCase() === selectedSubcategory.toLowerCase();

      // Coincidencia por término de búsqueda (Nombre, Marca, Código de Barras o Pasillos)
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.barcode && p.barcode.includes(query)) ||
        (p.subcategory?.name &&
          p.subcategory.name.toLowerCase().includes(query)) ||
        (p.subcategory?.category?.name &&
          p.subcategory.category.name.toLowerCase().includes(query));

      return matchesCategory && matchesSubcategory && matchesSearch;
    });
  }, [products, selectedCategory, selectedSubcategory, searchQuery]);

  // 5. SECCIONES DESTACADAS
  const recommendedProducts = useMemo(
    () => products.filter((p) => p.isRecommended),
    [products],
  );

  const discountedProducts = useMemo(
    () => products.filter((p) => p.discountPrice && p.discountPrice < p.price),
    [products],
  );

  const bestSellers = useMemo(
    () =>
      [...products]
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 8),
    [products],
  );

  // 6. PROCESAMIENTO DEL CHECKOUT
  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      await orderService.createOrder({
        customerName: user?.name || "Cliente Invitado",
        customerID: "V-99999999",
        customerPhone: "0412-0000000",
        paymentMethod: "Efectivo / Pendiente",
        customerEmail: user?.email,
        items: items,
      });

      alert(
        `¡Gracias ${user?.name || ""}! Pedido realizado con éxito. El personal ya está preparando tu compra.`,
      );
      clearCart();
      setShowCart(false);
      fetchData(); // Recarga stock actualizado
    } catch (e: any) {
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
        filteredProducts,
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
