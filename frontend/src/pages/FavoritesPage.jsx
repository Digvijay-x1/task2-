import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  IconButton,
  Chip,
  Paper,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Favorite,
  ShoppingCart,
  Visibility,
  FavoriteBorder,
  ArrowBack,
} from "@mui/icons-material";

import { favoritesAPI, queryKeys } from "../utils/api";
import { formatProductIdWithChecksum } from "../utils/seedUtils";
import useCartStore from "../stores/cartStore";
import useFavoritesStore from "../stores/favoritesStore";
import useActivityStore from "../stores/activityStore";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorited } = useFavoritesStore();
  const { logPageVisit, logProductView, logCartAction, logFavoriteAction } =
    useActivityStore();

  // Fetch favorites
  const {
    data: favoritesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.favorites(),
    queryFn: () => favoritesAPI.getFavorites(),
  });

  useEffect(() => {
    logPageVisit("Favorites Page", "/favorites");
  }, [logPageVisit]);

  const handleProductClick = (product) => {
    logProductView(product.id, product.name);
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (product, event) => {
    event.stopPropagation();
    const result = await addItem(product, 1);
    if (result.success) {
      logCartAction("add", product.id, product.name, 1);
    }
  };

  const handleRemoveFromFavorites = async (product, event) => {
    event.stopPropagation();
    const result = await toggleFavorite(product.id);
    if (result.success) {
      logFavoriteAction("remove", product.id, product.name);
      refetch(); // Refresh the favorites list
    }
  };

  const ProductCard = ({ product }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
      onClick={() => handleProductClick(product)}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.images?.[0]?.url || "/placeholder-product.jpg"}
        alt={product.name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            noWrap
            sx={{ flexGrow: 1, mr: 1 }}
          >
            {product.name}
          </Typography>
          <Chip
            label={`ID: ${formatProductIdWithChecksum(product.id)}`}
            size="small"
            variant="outlined"
            color="primary"
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

        {!product.availability && (
          <Chip
            label="Out of Stock"
            size="small"
            color="error"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <IconButton
          onClick={(e) => handleRemoveFromFavorites(product, e)}
          color="error"
          size="small"
        >
          <Favorite />
        </IconButton>

        <Button
          variant="contained"
          size="small"
          startIcon={<ShoppingCart />}
          onClick={(e) => handleAddToCart(product, e)}
          disabled={!product.availability || product.quantity === 0}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/products")}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold">
            My Favorites
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Products you've liked and bookmarked
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load favorites:{" "}
          {error.response?.data?.error || error.message}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={24} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: "100%" }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Favorites Grid */}
      {!isLoading && favoritesData?.data?.favorites && (
        <>
          {favoritesData.data.favorites.length === 0 ? (
            // Empty favorites
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <FavoriteBorder
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                No favorites yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Start browsing products and click the heart icon to add them to
                your favorites
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/products")}
              >
                Browse Products
              </Button>
            </Paper>
          ) : (
            <>
              {/* Favorites Count */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  {favoritesData.data.favorites.length} Favorite
                  {favoritesData.data.favorites.length !== 1 ? "s" : ""}
                </Typography>
              </Box>

              {/* Products Grid */}
              <Grid container spacing={3}>
                {favoritesData.data.favorites.map((favorite) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={favorite.id}>
                    <ProductCard product={favorite.product} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      {/* Quick Actions */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/products")}
          sx={{ mr: 2 }}
        >
          Continue Shopping
        </Button>
        <Button variant="contained" onClick={() => navigate("/cart")}>
          View Cart
        </Button>
      </Box>
    </Container>
  );
};

export default FavoritesPage;
