import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000/api/v1" : "/api/v1"; 
// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include cookies for authentication
  timeout: 60000, // 60 second timeout for image uploads
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Response Error:",
      error.response?.status,
      error.response?.data
    );

    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login or clear auth state
      console.log("🔒 Unauthorized access - user may need to login");
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
};

// Products API functions
export const productsAPI = {
  getProducts: (params = {}) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post("/products", productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  getSellerProducts: (sellerId) => api.get(`/products/my/listings`),
  getMyListings: (params = {}) => api.get("/products/my/listings", { params }),
};

// Categories API functions
export const categoriesAPI = {
  getCategories: () => api.get("/categories"),
  getCategory: (id, params = {}) => api.get(`/categories/${id}`, { params }),
  createCategory: (categoryData) => api.post("/categories", categoryData),
  updateCategory: (id, categoryData) =>
    api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Cart API functions
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity = 1) =>
    api.post("/cart/add", { productId, quantity }),
  updateCartItem: (cartItemId, quantity) =>
    api.put(`/cart/${cartItemId}`, { quantity }),
  removeFromCart: (cartItemId) => api.delete(`/cart/${cartItemId}`),
  clearCart: () => api.delete("/cart/clear/all"),
};

// Favorites API functions
export const favoritesAPI = {
  getFavorites: (params = {}) => api.get("/favorites", { params }),
  addToFavorites: (productId) => api.post(`/favorites/${productId}`),
  removeFromFavorites: (productId) => api.delete(`/favorites/${productId}`),
  toggleFavorite: (productId) => api.post(`/favorites/toggle/${productId}`),
  checkFavoriteStatus: (productId) => api.get(`/favorites/check/${productId}`),
};

// Checkout API functions
export const checkoutAPI = {
  processCheckout: (checkoutData, idempotencyKey) => {
    return api.post("/checkout", checkoutData, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  },
  getOrders: (params = {}) => api.get("/orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }),
};

// Utility functions
export const generateIdempotencyKey = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Error handler utility
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || "An error occurred",
      status: error.response.status,
      details: error.response.data?.details,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: "Network error - please check your connection",
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || "An unexpected error occurred",
      status: 0,
    };
  }
};

// Query key factories for TanStack Query
export const queryKeys = {
  // Auth
  profile: ["profile"],

  // Products
  products: (params) => ["products", params],
  product: (id) => ["product", id],
  myListings: (params) => ["myListings", params],
  sellerProducts: (sellerId) => ["sellerProducts", sellerId],

  // Categories
  categories: ["categories"],
  category: (id, params) => ["category", id, params],

  // Cart
  cart: ["cart"],

  // Favorites
  favorites: (params) => ["favorites", params],
  favoriteStatus: (productId) => ["favoriteStatus", productId],

  // Orders
  orders: (params) => ["orders", params],
  order: (id) => ["order", id],
};

export default api;
