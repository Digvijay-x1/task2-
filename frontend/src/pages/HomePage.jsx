import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  Chip,
  IconButton,
  Skeleton,
  Alert,
  Paper
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Visibility,
  TrendingUp,
  Store
} from '@mui/icons-material';

import { productsAPI, categoriesAPI, queryKeys } from '../utils/api';
import { formatProductIdWithChecksum } from '../utils/seedUtils';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import useFavoritesStore from '../stores/favoritesStore';
import useActivityStore from '../stores/activityStore';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorited } = useFavoritesStore();
  const { logPageVisit, logProductView, logCartAction, logFavoriteAction } = useActivityStore();

  // Fetch latest products for homepage feed
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: queryKeys.products({ page: 1, limit: 12 }),
    queryFn: () => productsAPI.getProducts({ page: 1, limit: 12 }),
  });

  // Fetch categories for quick navigation
  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesAPI.getCategories(),
  });

  useEffect(() => {
    logPageVisit('Home Page', '/');
  }, [logPageVisit]);

  const handleProductClick = (product) => {
    logProductView(product.id, product.name);
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (product, event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const result = await addItem(product, 1);
    if (result.success) {
      logCartAction('add', product.id, product.name, 1);
    }
  };

  const handleToggleFavorite = async (product, event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const wasLiked = isFavorited(product.id);
    const result = await toggleFavorite(product.id);
    if (result.success) {
      logFavoriteAction(wasLiked ? 'remove' : 'add', product.id, product.name);
    }
  };

  const ProductCard = ({ product }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
      onClick={() => handleProductClick(product)}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.images?.[0]?.url || '/placeholder-product.jpg'}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h3" noWrap sx={{ flexGrow: 1, mr: 1 }}>
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
          {product.description?.length > 100 && '...'}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" color="primary" fontWeight="bold">
            ${product.price}
          </Typography>
          <Chip
            label={product.condition}
            size="small"
            color={product.condition === 'New' ? 'success' : 'default'}
          />
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          Seller: {product.seller?.name} • {product.seller?.location}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box>
          <IconButton
            onClick={(e) => handleToggleFavorite(product, e)}
            color={isFavorited(product.id) ? 'error' : 'default'}
            size="small"
          >
            {isFavorited(product.id) ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <IconButton size="small">
            <Visibility />
          </IconButton>
        </Box>
        
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            mb: { xs: 4, md: 6 },
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 2
            }}
          >
            Welcome to Marketplace
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.95,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Discover amazing deals on quality pre-owned items from trusted sellers
          </Typography>
          <Box sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
            mt: 4
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Store />}
              onClick={() => navigate('/products')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: 3,
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: 6
                },
                transition: 'all 0.3s ease'
              }}
            >
              Browse Products
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: 'grey.300',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Join as Seller
              </Button>
            )}
          </Box>
        </Paper>

      {/* Categories Quick Navigation */}
      {categoriesData?.data?.categories && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" />
            Shop by Category
          </Typography>
          <Grid container spacing={2}>
            {categoriesData.data.categories.slice(0, 6).map((category) => (
              <Grid item xs={6} sm={4} md={2} key={category.id}>
                <Card
                  sx={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => navigate(`/products?category=${category.id}`)}
                >
                  <CardContent>
                    <Typography variant="body2" fontWeight="medium">
                      {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category._count?.products || 0} items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Latest Products Feed */}
      <Box>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store color="primary" />
          Latest Listings
        </Typography>
        
        {productsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load products: {productsError.response?.data?.error || productsError.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {productsLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={24} sm={6} md={4} lg={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            // Product cards
            productsData?.data?.products?.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))
          )}
        </Grid>

        {/* View All Products Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/products')}
          >
            View All Products
          </Button>
        </Box>
      </Box>
    </Container>
    </Box>
  );
};

export default HomePage;
