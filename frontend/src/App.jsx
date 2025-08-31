import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider, CssBaseline } from "@mui/material";

// Import utilities
import { initializeSeedTheme } from "./utils/seedUtils";
import { lightTheme, darkTheme } from "./theme/muiTheme";
import useAuthStore from "./stores/authStore";
import useActivityStore from "./stores/activityStore";
import useThemeStore from "./stores/themeStore";

// Import components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Import pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AboutPage from "./pages/AboutPage";
import HealthPage from "./pages/HealthPage";
import LogsPage from "./pages/LogsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { fetchUser } = useAuthStore();
  const { logPageVisit } = useActivityStore();
  const { isDarkMode, initializeTheme } = useThemeStore();

  useEffect(() => {
    // Initialize seed-based theme
    initializeSeedTheme();

    // Initialize Material-UI theme
    initializeTheme();

    // Try to fetch user if token exists
    fetchUser();

    // Log app initialization
    logPageVisit("App Initialization", "/");
  }, [fetchUser, logPageVisit, initializeTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Special deployment routes */}
                <Route path="/IEC2024058/healthz" element={<HealthPage />} />
                <Route path="/logs/recent" element={<LogsPage />} />

                {/* Protected routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Seller routes */}
                <Route
                  path="/seller/*"
                  element={
                    <ProtectedRoute requiredRole="Seller">
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>

        {/* React Query Devtools (only in development) */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
