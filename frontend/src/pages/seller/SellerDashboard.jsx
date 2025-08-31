import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import AddProductPage from "./AddProductPage";
import SellerListingsPage from "./SellerListingsPage";
import { productsAPI, queryKeys } from "../../utils/api";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import {
  Add,
  Inventory,
  TrendingUp,
  AttachMoney,
  Store,
} from "@mui/icons-material";

import useAuthStore from "../../stores/authStore";
import useActivityStore from "../../stores/activityStore";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { logPageVisit } = useActivityStore();

  // Fetch seller's products for statistics
  const { data: sellerProductsData } = useQuery({
    queryKey: queryKeys.myListings(),
    queryFn: () => productsAPI.getSellerProducts(),
    enabled: !!user?.id && location.pathname === "/seller",
  });

  useEffect(() => {
    logPageVisit("Seller Dashboard", "/seller");
  }, [logPageVisit]);

  // If we're on a sub-route, render that component
  if (location.pathname !== "/seller") {
    return (
      <Routes>
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/listings" element={<SellerListingsPage />} />
        {/* Add more seller routes here as needed */}
      </Routes>
    );
  }

  // Calculate real seller stats from fetched data
  const products = sellerProductsData?.data?.products || [];
  const sellerStats = {
    totalListings: products.length,
    activeListings: products.filter((p) => p.availability).length,
    totalSales: 0, // Would come from orders API
    totalRevenue: 0, // Would come from orders API
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box
          sx={{
            mb: { xs: 3, md: 4 },
            textAlign: { xs: "center", md: "left" },
            px: { xs: 2, md: 0 },
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              mb: 1,
            }}
          >
            Seller Dashboard
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontSize: { xs: "1rem", md: "1.25rem" },
              maxWidth: "600px",
              mx: { xs: "auto", md: 0 },
            }}
          >
            Welcome back, {user?.name}! Manage your listings and track your
            sales.
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate("/seller/add-product")}
            sx={{ mr: 2 }}
          >
            Add New Product
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/seller/listings")}
          >
            Manage Listings
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Inventory color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {sellerStats.totalListings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Listings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Store color="success.main" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {sellerStats.activeListings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Listings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <TrendingUp color="info.main" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {sellerStats.totalSales}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sales
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <AttachMoney
                  color="warning.main"
                  sx={{ fontSize: 40, mb: 1 }}
                />
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  ${sellerStats.totalRevenue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Getting Started */}
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Store sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Start Selling Today!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            List your first product to start earning money on the marketplace.
            Our platform makes it easy to reach buyers and manage your
            inventory.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate("/seller/add-product")}
          >
            List Your First Product
          </Button>
        </Paper>

        {/* Nested Routes for Seller Features */}
        <Routes>{/* Add more seller routes here as needed */}</Routes>
      </Container>
    </Box>
  );
};

export default SellerDashboard;
