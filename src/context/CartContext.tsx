import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types/index.ts';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items));
    } catch (err) {
      console.error('Error al guardar carrito en localStorage:', err);
    }
  }, [items]);

  const addItem = (product: Product, quantity: number) => {
    const effectivePrice = Number(product.discountPrice || product.price);

    setItems(current => {
      const existing = current.find(item => item.productId === product.id);
      if (existing) {
        return current.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity, price: effectivePrice }
            : item
        ).filter(item => item.quantity > 0);
      }
      if (quantity <= 0) return current;
      return [...current, { 
        productId: product.id, 
        name: product.name, 
        price: effectivePrice, 
        quantity 
      }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(current => {
      if (quantity <= 0) {
        return current.filter(item => item.productId !== productId);
      }
      return current.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      );
    });
  };

  const removeItem = (productId: string) => {
    setItems(current => current.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart_items');
  };

  const total = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total }}>
      { children }
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
