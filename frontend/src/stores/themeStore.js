import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      isDarkMode: false,

      // Actions
      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        
        // Update document class for any CSS that depends on it
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setDarkMode: (isDark) => {
        set({ isDarkMode: isDark });
        
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Initialize theme on app start
      initializeTheme: () => {
        const isDark = get().isDarkMode;
        
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ 
        isDarkMode: state.isDarkMode 
      }),
    }
  )
);

export default useThemeStore;
