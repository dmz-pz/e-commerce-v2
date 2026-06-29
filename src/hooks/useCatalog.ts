import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { items, total, clearCart, removeItem, addItem } = useCart();
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => 
    ['all', ...new Set(products.map(p => p.category))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const recommendedProducts = useMemo(() => 
    products.filter(p => p.isRecommended), 
    [products]
  );

  const discountedProducts = useMemo(() => 
    products.filter(p => p.discountPrice && p.discountPrice < p.price), 
    [products]
  );

  const bestSellers = useMemo(() => 
    [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5), 
    [products]
  );

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: "Cliente de Prueba",
          items: items
        })
      });
      
      if (res.ok) {
        alert("¡Pedido realizado con éxito! El personal ya está preparando tu compra.");
        clearCart();
        setShowCart(false);
        const pRes = await fetch('/api/products');
        setProducts(await pRes.json());
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      alert("Error al procesar el pedido");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    checkoutLoading,
    loading,
    isCategoriesOpen,
    setIsCategoriesOpen,
    items,
    total,
    removeItem,
    addItem,
    showCart,
    setShowCart,
    categories,
    filteredProducts,
    recommendedProducts,
    discountedProducts,
    bestSellers,
    handleCheckout
  };
}
