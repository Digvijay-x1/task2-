import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFavoritesStore = create(
  persist(
    (set, get) => ({
      // State
      favorites: [],
      isLoading: false,
      error: null,

      // Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Add to favorites
      addToFavorites: async (productId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`http://localhost:3000/api/v1/favorites/${productId}`, {
            method: 'POST',
            credentials: 'include',
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to add to favorites');
          }

          // Add to local state
          const favorites = get().favorites;
          if (!favorites.some(fav => fav.product.id === productId)) {
            set({ 
              favorites: [...favorites, data.favorite],
              isLoading: false 
            });
          }

          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Remove from favorites
      removeFromFavorites: async (productId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`http://localhost:3000/api/v1/favorites/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to remove from favorites');
          }

          // Remove from local state
          const favorites = get().favorites.filter(fav => fav.product.id !== productId);
          set({ favorites, isLoading: false });

          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Toggle favorite status
      toggleFavorite: async (productId) => {
        const isFavorited = get().isFavorited(productId);
        
        if (isFavorited) {
          return await get().removeFromFavorites(productId);
        } else {
          return await get().addToFavorites(productId);
        }
      },

      // Fetch favorites from server
      fetchFavorites: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:3000/api/v1/favorites', {
            credentials: 'include',
          });

          if (!response.ok) {
            if (response.status === 401) {
              // User not authenticated, clear favorites
              set({ favorites: [], isLoading: false });
              return;
            }
            const data = await response.json();
            throw new Error(data.error || 'Failed to fetch favorites');
          }

          const data = await response.json();
          set({ 
            favorites: data.favorites || [], 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false,
            favorites: [] 
          });
        }
      },

      // Local operations
      addToFavoritesLocal: (product) => {
        const favorites = get().favorites;
        if (!favorites.some(fav => fav.product.id === product.id)) {
          const newFavorite = {
            id: Date.now(), // Temporary ID
            product,
            createdAt: new Date().toISOString()
          };
          set({ favorites: [...favorites, newFavorite] });
        }
      },

      removeFromFavoritesLocal: (productId) => {
        const favorites = get().favorites.filter(fav => fav.product.id !== productId);
        set({ favorites });
      },

      // Getters
      isFavorited: (productId) => {
        return get().favorites.some(fav => fav.product.id === productId);
      },

      getFavoriteCount: () => {
        return get().favorites.length;
      },

      getFavoriteProducts: () => {
        return get().favorites.map(fav => fav.product);
      }
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ 
        favorites: state.favorites 
      }),
    }
  )
);

export default useFavoritesStore;
