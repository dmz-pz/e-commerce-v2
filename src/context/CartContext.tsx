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
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, quantity: number) => {
    setItems(current => {
      const existing = current.find(item => item.productId === product.id);
      if (existing) {
        return current.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ).filter(item => item.quantity > 0);
      }
      if (quantity <= 0) return current;
      return [...current, { 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
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

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
