import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useActivityStore = create(
  persist(
    (set, get) => ({
      // State
      activities: [],
      maxActivities: 20, // Keep last 20 activities

      // Actions
      logActivity: (action, details = {}) => {
        const activities = get().activities;
        const maxActivities = get().maxActivities;
        
        const newActivity = {
          id: Date.now(),
          action,
          details,
          timestamp: new Date().toISOString(),
          url: window.location.pathname,
          userAgent: navigator.userAgent.substring(0, 50) + '...' // Truncated for privacy
        };

        // Add new activity and keep only the last maxActivities
        const updatedActivities = [newActivity, ...activities].slice(0, maxActivities);
        
        set({ activities: updatedActivities });
      },

      // Specific activity loggers
      logSearch: (query, filters = {}) => {
        get().logActivity('SEARCH', {
          query,
          filters,
          type: 'product_search'
        });
      },

      logProductView: (productId, productName) => {
        get().logActivity('PRODUCT_VIEW', {
          productId,
          productName,
          type: 'product_interaction'
        });
      },

      logCartAction: (action, productId, productName, quantity = 1) => {
        get().logActivity('CART_ACTION', {
          action, // 'add', 'remove', 'update'
          productId,
          productName,
          quantity,
          type: 'cart_interaction'
        });
      },

      logFavoriteAction: (action, productId, productName) => {
        get().logActivity('FAVORITE_ACTION', {
          action, // 'add', 'remove'
          productId,
          productName,
          type: 'favorite_interaction'
        });
      },

      logPageVisit: (pageName, pageUrl) => {
        get().logActivity('PAGE_VISIT', {
          pageName,
          pageUrl,
          type: 'navigation'
        });
      },

      logCheckout: (orderTotal, itemCount) => {
        get().logActivity('CHECKOUT', {
          orderTotal,
          itemCount,
          type: 'transaction'
        });
      },

      logLogin: (userEmail, userRole) => {
        get().logActivity('LOGIN', {
          userEmail: userEmail.substring(0, 3) + '***', // Redacted for privacy
          userRole,
          type: 'authentication'
        });
      },

      logLogout: () => {
        get().logActivity('LOGOUT', {
          type: 'authentication'
        });
      },

      logCategoryFilter: (categoryName, categoryId) => {
        get().logActivity('CATEGORY_FILTER', {
          categoryName,
          categoryId,
          type: 'filter_interaction'
        });
      },

      logPriceFilter: (minPrice, maxPrice) => {
        get().logActivity('PRICE_FILTER', {
          minPrice,
          maxPrice,
          type: 'filter_interaction'
        });
      },

      // Getters
      getRecentActivities: (limit = 20) => {
        return get().activities.slice(0, limit);
      },

      getActivitiesByType: (type) => {
        return get().activities.filter(activity => activity.details.type === type);
      },

      getActivityStats: () => {
        const activities = get().activities;
        const stats = {
          total: activities.length,
          searches: 0,
          productViews: 0,
          cartActions: 0,
          favoriteActions: 0,
          pageVisits: 0,
          transactions: 0
        };

        activities.forEach(activity => {
          switch (activity.details.type) {
            case 'product_search':
              stats.searches++;
              break;
            case 'product_interaction':
              stats.productViews++;
              break;
            case 'cart_interaction':
              stats.cartActions++;
              break;
            case 'favorite_interaction':
              stats.favoriteActions++;
              break;
            case 'navigation':
              stats.pageVisits++;
              break;
            case 'transaction':
              stats.transactions++;
              break;
          }
        });

        return stats;
      },

      clearActivities: () => {
        set({ activities: [] });
      }
    }),
    {
      name: 'activity-storage',
      partialize: (state) => ({ 
        activities: state.activities 
      }),
    }
  )
);

export default useActivityStore;
