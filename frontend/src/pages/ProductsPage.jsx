import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Pagination,
  Skeleton,
  Alert,
  Paper,
  Slider,
} from "@mui/material";
import {
  Search,
  FilterList,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Clear,
} from "@mui/icons-material";

import { productsAPI, categoriesAPI, queryKeys } from "../utils/api";
import { formatProductIdWithChecksum } from "../utils/seedUtils";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import useFavoritesStore from "../stores/favoritesStore";
import useActivityStore from "../stores/activityStore";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorited } = useFavoritesStore();
  const {
    logPageVisit,
    logSearch,
    logProductView,
    logCartAction,
    logFavoriteAction,
    logCategoryFilter,
    logPriceFilter,
  } = useActivityStore();

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    location: searchParams.get("location") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    page: parseInt(searchParams.get("page")) || 1,
  });

  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products with filters
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => productsAPI.getProducts(filters),
    keepPreviousData: true,
  });

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesAPI.getCategories(),
  });

  useEffect(() => {
    logPageVisit("Products Page", "/products");
  }, [logPageVisit]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));

    // Log specific filter actions
    if (key === "category" && value) {
      const category = categoriesData?.data?.categories?.find(
        (cat) => cat.id === parseInt(value)
      );
      logCategoryFilter(category?.name, value);
    }
  };

  const handleSearch = () => {
    if (filters.search.trim()) {
      logSearch(filters.search, {
        category: filters.category,
        condition: filters.condition,
      });
    }
  };

  const handlePriceRangeChange = (_, newValue) => {
    setPriceRange(newValue);
    setFilters((prev) => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1],
      page: 1,
    }));
    logPriceFilter(newValue[0], newValue[1]);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      condition: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      page: 1,
    });
    setPriceRange([0, 1000]);
  };

  const handleProductClick = (product) => {
    logProductView(product.id, product.name);
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (product, event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const result = await addItem(product, 1);
    if (result.success) {
      logCartAction("add", product.id, product.name, 1);
    }
  };

  const handleToggleFavorite = async (product, event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const wasLiked = isFavorited(product.id);
    const result = await toggleFavorite(product.id);
    if (result.success) {
      logFavoriteAction(wasLiked ? "remove" : "add", product.id, product.name);
    }
  };

  const ProductCard = ({ product }) => (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6,
          borderColor: "primary.main",
        },
      }}
      onClick={() => handleProductClick(product)}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="220"
          image={product.images?.[0]?.url || "/placeholder-product.jpg"}
          alt={product.name}
          sx={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
        {!product.availability && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" color="white" fontWeight="bold">
              SOLD OUT
            </Typography>
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              flexGrow: 1,
              mr: 1,
              fontWeight: "bold",
              fontSize: "1.1rem",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.name}
          </Typography>
          <Chip
            label={`ID: ${formatProductIdWithChecksum(product.id)}`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{
              fontSize: "0.7rem",
              fontFamily: "monospace",
              fontWeight: "bold",
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.description?.substring(0, 100)}
          {product.description?.length > 100 && "..."}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h5" color="primary" fontWeight="bold">
            ${product.price}
          </Typography>
          <Chip
            label={product.condition}
            size="small"
            color={product.condition === "New" ? "success" : "default"}
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          {product.seller?.name} • {product.seller?.location}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: "space-between",
          px: 2,
          pb: 2,
          pt: 1,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconButton
          onClick={(e) => handleToggleFavorite(product, e)}
          color={isFavorited(product.id) ? "error" : "default"}
          size="medium"
          sx={{
            borderRadius: 2,
            "&:hover": {
              transform: "scale(1.1)",
              bgcolor: isFavorited(product.id) ? "error.light" : "action.hover",
            },
            transition: "all 0.2s ease",
          }}
        >
          {isFavorited(product.id) ? <Favorite /> : <FavoriteBorder />}
        </IconButton>

        <Button
          variant="contained"
          size="medium"
          startIcon={<ShoppingCart />}
          onClick={(e) => handleAddToCart(product, e)}
          disabled={!product.availability || product.quantity === 0}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: "bold",
            boxShadow: 2,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: 4,
            },
            "&:disabled": {
              bgcolor: "action.disabledBackground",
              color: "action.disabled",
            },
            transition: "all 0.2s ease",
          }}
        >
          {!product.availability ? "Sold Out" : "Add to Cart"}
        </Button>
      </CardActions>
    </Card>
  );

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
            Browse Products
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
            Discover amazing deals on quality pre-owned items from trusted
            sellers
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, md: 3 },
            mb: { xs: 3, md: 4 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 3, fontWeight: "bold" }}
          >
            Find Your Perfect Item
          </Typography>
          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search products, brands, or descriptions..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Search sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    endAdornment: filters.search && (
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange("search", "")}
                        sx={{ mr: -1 }}
                      >
                        <Clear />
                      </IconButton>
                    ),
                  },
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} md={3}>
              <FormControl >
                <InputLabel>Category</InputLabel>
                <Select 
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categoriesData?.data?.categories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Condition Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={filters.condition}
                  onChange={(e) =>
                    handleFilterChange("condition", e.target.value)
                  }
                  label="Condition"
                >
                  <MenuItem value="">All Conditions</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="LikeNew">Like New</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                  <MenuItem value="Used">Used</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Filter Toggle */}
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          {showFilters && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    placeholder="Filter by seller location"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={2000}
                    step={10}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Button
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  variant="text"
                >
                  Clear All Filters
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Results */}
        {productsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load products:{" "}
            {productsError.response?.data?.error || productsError.message}
          </Alert>
        )}

        {/* Products Grid */}
        <Grid container spacing={3}>
          {productsLoading
            ? // Loading skeletons
              Array.from({ length: 12 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card sx={{ height: "100%" }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" height={20} width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : productsData?.data?.products?.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
        </Grid>

        {/* No Results */}
        {!productsLoading && productsData?.data?.products?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search criteria or browse all categories
            </Typography>
            <Button variant="contained" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        )}

        {/* Pagination */}
        {productsData?.data?.pagination &&
          productsData.data.pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={productsData.data.pagination.totalPages}
                page={filters.page}
                onChange={(_, page) => handleFilterChange("page", page)}
                color="primary"
                size="large"
              />
            </Box>
          )}

        {/* Results Summary */}
        {productsData?.data?.pagination && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {productsData.data.products.length} of{" "}
              {productsData.data.pagination.totalCount} products
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductsPage;
