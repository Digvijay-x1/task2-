import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculatePlatformFee } from '../utils/seedUtils';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      error: null,

      // Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Add item to cart
      addItem: async (product, quantity = 1) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:3000/api/v1/cart/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              productId: product.id,
              quantity
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to add item to cart');
          }

          // Refresh cart
          await get().fetchCart();
          
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Update item quantity
      updateItem: async (cartItemId, quantity) => {
        if (quantity <= 0) {
          return get().removeItem(cartItemId);
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`http://localhost:3000/api/v1/cart/${cartItemId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ quantity }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to update cart item');
          }

          // Update local state
          const items = get().items.map(item => 
            item.id === cartItemId 
              ? { ...item, quantity }
              : item
          );
          
          set({ items, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Remove item from cart
      removeItem: async (cartItemId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`http://localhost:3000/api/v1/cart/${cartItemId}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to remove item from cart');
          }

          // Update local state
          const items = get().items.filter(item => item.id !== cartItemId);
          set({ items, isLoading: false });
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Clear entire cart
      clearCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:3000/api/v1/cart/clear/all', {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to clear cart');
          }

          set({ items: [], isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Fetch cart from server
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:3000/api/v1/cart', {
            credentials: 'include',
          });

          if (!response.ok) {
            if (response.status === 401) {
              // User not authenticated, clear cart
              set({ items: [], isLoading: false });
              return;
            }
            const data = await response.json();
            throw new Error(data.error || 'Failed to fetch cart');
          }

          const data = await response.json();
          set({ 
            items: data.cartItems || [], 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false,
            items: [] 
          });
        }
      },

      // Local cart operations (for optimistic updates)
      addItemLocal: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.product.id === product.id);
        
        if (existingItem) {
          const updatedItems = items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({ items: updatedItems });
        } else {
          const newItem = {
            id: Date.now(), // Temporary ID
            quantity,
            product,
            createdAt: new Date().toISOString()
          };
          set({ items: [...items, newItem] });
        }
      },

      // Getters
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
        }, 0);
      },

      getPlatformFee: () => {
        const subtotal = get().getSubtotal();
        return calculatePlatformFee(subtotal);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const platformFee = get().getPlatformFee();
        return subtotal + platformFee;
      },

      getCartSummary: () => {
        const items = get().items;
        const itemCount = get().getItemCount();
        const subtotal = get().getSubtotal();
        const platformFee = get().getPlatformFee();
        const total = get().getTotal();

        return {
          items,
          itemCount,
          subtotal: parseFloat(subtotal.toFixed(2)),
          platformFee: parseFloat(platformFee.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          isEmpty: items.length === 0
        };
      },

      isInCart: (productId) => {
        return get().items.some(item => item.product.id === productId);
      },

      getCartItem: (productId) => {
        return get().items.find(item => item.product.id === productId);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items 
      }),
    }
  )
);

export default useCartStore;
