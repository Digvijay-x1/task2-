import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Rating,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Share,
  Store,
  LocationOn,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

import { productsAPI, queryKeys } from '../utils/api';
import { formatProductIdWithChecksum } from '../utils/seedUtils';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import useFavoritesStore from '../stores/favoritesStore';
import useActivityStore from '../stores/activityStore';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem, isInCart } = useCartStore();
  const { toggleFavorite, isFavorited } = useFavoritesStore();
  const { logPageVisit, logProductView, logCartAction, logFavoriteAction } = useActivityStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: productData, isLoading, error } = useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => productsAPI.getProduct(id),
    enabled: !!id,
  });

  const product = productData?.data;

  useEffect(() => {
    if (product) {
      logPageVisit(`Product: ${product.name}`, `/products/${id}`);
      logProductView(product.id, product.name);
    }
  }, [product, id, logPageVisit, logProductView]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const result = await addItem(product, quantity);
    if (result.success) {
      logCartAction('add', product.id, product.name, quantity);
    }
  };

  const handleToggleFavorite = async () => {
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this ${product.condition} ${product.name} for $${product.price}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a snackbar here
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Product not found or failed to load
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImageIndex] || { url: '/placeholder-product.jpg' };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              {/* Main Image */}
              <Box sx={{ mb: 2 }}>
                <img
                  src={mainImage.url}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </Box>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <ImageList cols={4} gap={8}>
                  {images.map((image, index) => (
                    <ImageListItem
                      key={index}
                      sx={{
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? 2 : 0,
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover'
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Product Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ flexGrow: 1, mr: 2 }}>
                  {product.name}
                </Typography>
                <Chip
                  label={`ID: ${formatProductIdWithChecksum(product.id)}`}
                  variant="outlined"
                  color="primary"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  ${product.price}
                </Typography>
                <Chip
                  label={product.condition}
                  color={product.condition === 'New' ? 'success' : 'default'}
                />
                {product.availability ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Available"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    icon={<Cancel />}
                    label="Out of Stock"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                {product.description}
              </Typography>
            </Box>

            {/* Product Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6">Quantity:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Typography variant="h6" sx={{ mx: 2, minWidth: '40px', textAlign: 'center' }}>
                      {quantity}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      disabled={quantity >= product.quantity}
                    >
                      +
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    ({product.quantity} available)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={!product.availability || product.quantity === 0 || isInCart(product.id)}
                    sx={{ flexGrow: 1 }}
                  >
                    {isInCart(product.id) ? 'Already in Cart' : 'Add to Cart'}
                  </Button>
                  
                  <IconButton
                    onClick={handleToggleFavorite}
                    color={isFavorited(product.id) ? 'error' : 'default'}
                    size="large"
                  >
                    {isFavorited(product.id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  
                  <IconButton onClick={handleShare} size="large">
                    <Share />
                  </IconButton>
                </Box>

                {isInCart(product.id) && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Store />
                  Seller Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {product.seller?.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {product.seller?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {product.seller?.location || 'Location not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {product.seller?.contactInfo && (
                  <Typography variant="body2" color="text.secondary">
                    Contact: {product.seller.contactInfo}
                  </Typography>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/seller/${product.seller?.id}`)}
                >
                  View Seller Profile
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Product Specifications */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Product Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">SKU</Typography>
              <Typography variant="body1" fontWeight="medium">{product.sku}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Condition</Typography>
              <Typography variant="body1" fontWeight="medium">{product.condition}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Category</Typography>
              <Typography variant="body1" fontWeight="medium">{product.category?.name}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Listed</Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date(product.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProductDetailPage;
