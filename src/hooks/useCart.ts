'use client';

import { useState, useCallback, useEffect } from 'react';
import { CartItem } from '@/components/transactions/CartItemComponent';
import { ProductWithCategory } from '@/types/product';

/**
 * Storage key for cart data in localStorage
 */
const CART_STORAGE_KEY = 'shopping_cart';

/**
 * Custom hook for managing shopping cart functionality
 * Provides cart operations and persistence
 *
 * @param products - List of available products
 * @returns Object containing cart state and operations
 *
 * @example
 * const { cart, addToCart } = useCart(products)
 * // Add item to cart
 * addToCart(1)
 * // Get cart totals
 * const { totalAmount } = getCartTotals(10) // with 10% service charge
 */
export function useCart(products: ProductWithCategory[]) {
  /**
   * Initialize cart from localStorage if exists
   * Falls back to empty array if no saved cart
   */
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];

    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  /**
   * Save cart to localStorage whenever it changes
   * Removes storage key if cart is empty
   */
  useEffect(() => {
    if (cart.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  /**
   * Adds a product to cart or increases its quantity
   * @param productId - ID of product to add
   */
  const addToCart = useCallback(
    (productId: number) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      setCart(currentCart => {
        const existingItem = currentCart.find(item => item.id === productId);
        if (existingItem) {
          return currentCart.map(item => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
        }

        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        };
        return [...currentCart, cartItem];
      });
    },
    [products]
  );

  /**
   * Decreases quantity of a cart item or removes it
   * @param productId - ID of product to decrease
   */
  const decreaseQuantity = useCallback((productId: number) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === productId);
      if (!existingItem) return currentCart;

      if (existingItem.quantity === 1) {
        return currentCart.filter(item => item.id !== productId);
      }

      return currentCart.map(item => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
    });
  }, []);

  /**
   * Calculates cart totals with service charge
   * @param serviceChargePercentage - Service charge percentage (0-100)
   * @returns Object containing subtotal, service charge amount, and total
   */
  const getCartTotals = useCallback(
    (serviceChargePercentage: number) => {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const serviceChargeAmount = (subtotal * serviceChargePercentage) / 100;
      const totalAmount = subtotal + serviceChargeAmount;

      return {
        subtotal,
        serviceChargeAmount,
        totalAmount,
      };
    },
    [cart]
  );

  /**
   * Resets cart to empty state
   */
  const resetCart = useCallback(() => {
    setCart([]);
  }, []);

  /**
   * Syncs cart items with current products
   * Updates prices and names if products change
   */
  useEffect(() => {
    if (products.length > 0 && cart.length > 0) {
      const updatedCart = cart.map(cartItem => {
        const currentProduct = products.find(p => p.id === cartItem.id);
        if (!currentProduct) return cartItem;

        // Only update if there are changes
        if (currentProduct.name !== cartItem.name || currentProduct.price !== cartItem.price) {
          return {
            ...cartItem,
            name: currentProduct.name,
            price: currentProduct.price,
          };
        }
        return cartItem;
      });

      // Only update cart if there are actual changes
      if (JSON.stringify(updatedCart) !== JSON.stringify(cart)) {
        setCart(updatedCart);
      }
    }
  }, [products, cart]);

  return {
    cart,
    addToCart,
    decreaseQuantity,
    getCartTotals,
    resetCart,
  };
}
