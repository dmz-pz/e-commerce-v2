import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types/index.ts';
import { useCart } from './CartContext.tsx';
import { useUser } from './UserContext.tsx';
import { productService } from '../services/productService.ts';
import { orderService } from '../services/orderService.ts';

interface CatalogContextType {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (sub: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  categories: string[];
  subcategories: string[];
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

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { items, clearCart } = useCart();
  const { user } = useUser();

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSelectedSubcategory('all');
  }, [selectedCategory]);

  const categories = useMemo(() => 
    ['all', ...new Set(products.map(p => p.category))],
    [products]
  );

  const subcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    return ['all', ...new Set(products.filter(p => p.category === selectedCategory).map(p => p.subcategory))];
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'all' || p.subcategory === selectedSubcategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSubcategory && matchesSearch;
    });
  }, [products, selectedCategory, selectedSubcategory, searchQuery]);

  const recommendedProducts = useMemo(() => 
    products.filter(p => p.isRecommended), 
    [products]
  );

  const discountedProducts = useMemo(() => 
    products.filter(p => p.discountPrice && p.discountPrice < p.price), 
    [products]
  );

  const bestSellers = useMemo(() => 
    [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 8), 
    [products]
  );

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      await orderService.createOrder({
        customerName: user?.name || "Cliente Invitado",
        customerID: "V-99999999", // Valor por defecto para demostración
        customerPhone: "0412-0000000", // Valor por defecto
        paymentMethod: "Efectivo / Pendiente", // Valor por defecto
        customerEmail: user?.email,
        items: items
      });
      
      alert(`¡Gracias ${user?.name || ''}! Pedido realizado con éxito. El personal ya está preparando tu compra.`);
      clearCart();
      setShowCart(false);
      fetchProducts();
    } catch (e: any) {
      alert(e.message || "Error al procesar el pedido");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <CatalogContext.Provider value={{
      products,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      loading,
      categories,
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
      selectedSubcategory,
      setSelectedSubcategory,
      subcategories
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useGlobalCatalog = () => {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useGlobalCatalog must be used within a CatalogProvider');
  }
  return context;
};
