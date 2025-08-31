import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });

          return { success: true, user: data.user };
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false,
            user: null,
            isAuthenticated: false 
          });
          return { success: false, error: error.message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:3000/api/v1/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
          }

          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });

          return { success: true, user: data.user };
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false,
            user: null,
            isAuthenticated: false 
          });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await fetch('http://localhost:3000/api/v1/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        
        try {
          const response = await fetch('http://localhost:3000/api/v1/auth/me', {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: error.message 
          });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(profileData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Profile update failed');
          }

          set({ 
            user: data.user, 
            isLoading: false,
            error: null 
          });

          return { success: true, user: data.user };
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      // Getters
      isAdmin: () => get().user?.role === 'Admin',
      isSeller: () => get().user?.role === 'Seller' || get().user?.role === 'Admin',
      isBuyer: () => get().user?.role === 'Buyer',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;
