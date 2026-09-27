import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user, getAuthHeaders } = useAuth();
  const { showToast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/cart', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setSubtotal(data.subtotal || 0);
        setItemCount(data.itemCount || 0);
      }
    } catch (err) {
      console.error('Failed to load cart items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, getAuthHeaders]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = async (product: Product, quantity = 1): Promise<boolean> => {
    if (!user) {
      showToast('Please sign in to add items to your cart.', 'info');
      return false;
    }

    if (user.role === 'seller' && user.id === product.seller_id) {
      showToast('You cannot purchase your own produce listings.', 'error');
      return false;
    }

    if (!product.is_available || product.stock_quantity <= 0) {
      showToast(`"${product.title}" is currently out of stock.`, 'error');
      return false;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ product_id: product.id, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add item.', 'error');
        return false;
      }

      showToast(`Added ${quantity} ${product.unit} of ${product.title} to cart.`, 'success');
      await refreshCart();
      setIsCartOpen(true);
      return true;
    } catch (err) {
      showToast('Could not add product to cart.', 'error');
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update quantity.', 'error');
        return false;
      }

      await refreshCart();
      return true;
    } catch (err) {
      showToast('Could not update cart quantity.', 'error');
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        showToast('Failed to remove item.', 'error');
        return false;
      }

      showToast('Item removed from cart.', 'info');
      await refreshCart();
      return true;
    } catch (err) {
      showToast('Could not remove item.', 'error');
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) return false;
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        isCartOpen,
        isLoading,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
