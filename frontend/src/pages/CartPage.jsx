import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  ShoppingCartCheckout,
  ShoppingCart,
  ArrowBack,
} from "@mui/icons-material";

import {
  formatProductIdWithChecksum,
  extractSeedNumber,
  ASSIGNMENT_SEED,
} from "../utils/seedUtils";
import useCartStore from "../stores/cartStore";
import useActivityStore from "../stores/activityStore";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    isLoading,
    error,
    updateItem,
    removeItem,
    clearCart,
    fetchCart,
    getCartSummary,
  } = useCartStore();
  const { logPageVisit, logCartAction } = useActivityStore();

  const cartSummary = getCartSummary();
  const seedNumber = extractSeedNumber(ASSIGNMENT_SEED);

  useEffect(() => {
    logPageVisit("Cart Page", "/cart");
    fetchCart();
  }, [logPageVisit, fetchCart]);

  const handleQuantityChange = async (cartItem, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(cartItem);
      return;
    }

    const result = await updateItem(cartItem.id, newQuantity);
    if (result.success) {
      logCartAction(
        "update",
        cartItem.product.id,
        cartItem.product.name,
        newQuantity
      );
    }
  };

  const handleRemoveItem = async (cartItem) => {
    const result = await removeItem(cartItem.id);
    if (result.success) {
      logCartAction("remove", cartItem.product.id, cartItem.product.name, 0);
    }
  };

  const handleClearCart = async () => {
    const result = await clearCart();
    if (result.success) {
      logCartAction("clear", null, "All items", 0);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box
          sx={{
            mb: { xs: 3, md: 4 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: { xs: 1, md: 0 },
          }}
        >
          <IconButton
            onClick={() => navigate("/products")}
            sx={{
              bgcolor: "background.paper",
              boxShadow: 1,
              "&:hover": { boxShadow: 3 },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                mb: 0.5,
              }}
            >
              Shopping Cart
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
            >
              {cartSummary.itemCount}{" "}
              {cartSummary.itemCount === 1 ? "item" : "items"} in your cart
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {cartSummary.isEmpty ? (
          // Empty cart
          <Paper
            elevation={2}
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: "center",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ShoppingCart
              sx={{
                fontSize: { xs: 48, md: 64 },
                color: "text.secondary",
                mb: 3,
                opacity: 0.7,
              }}
            />
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
            >
              Your cart is empty
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                fontSize: { xs: "0.9rem", md: "1rem" },
                maxWidth: "400px",
                mx: "auto",
              }}
            >
              Start shopping to add items to your cart and enjoy our marketplace
              experience
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/products")}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderRadius: 2,
                boxShadow: 3,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 6,
                },
                transition: "all 0.3s ease",
              }}
            >
              Browse Products
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Cart Items */}
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Cart Items
                </Typography>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleClearCart}
                  disabled={isLoading}
                >
                  Clear Cart
                </Button>
              </Box>

              {items.map((cartItem) => (
                <Card key={cartItem.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Product Image */}
                      <Grid item xs={12} sm={3}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={
                            cartItem.product.images?.[0]?.url ||
                            "/placeholder-product.jpg"
                          }
                          alt={cartItem.product.name}
                          sx={{
                            objectFit: "cover",
                            borderRadius: 1,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate(`/products/${cartItem.product.id}`)
                          }
                        />
                      </Grid>

                      {/* Product Details */}
                      <Grid item xs={12} sm={5}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/products/${cartItem.product.id}`)
                            }
                          >
                            {cartItem.product.name}
                          </Typography>
                          <Chip
                            label={`ID: ${formatProductIdWithChecksum(
                              cartItem.product.id
                            )}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {cartItem.product.description?.substring(0, 100)}
                          {cartItem.product.description?.length > 100 && "..."}
                        </Typography>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Chip
                            label={cartItem.product.condition}
                            size="small"
                            color={
                              cartItem.product.condition === "New"
                                ? "success"
                                : "default"
                            }
                          />
                          <Typography variant="body2" color="text.secondary">
                            Seller: {cartItem.product.seller?.name}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Quantity Controls */}
                      <Grid item xs={12} sm={2}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(
                                cartItem,
                                cartItem.quantity - 1
                              )
                            }
                            disabled={isLoading}
                          >
                            <Remove />
                          </IconButton>

                          <TextField
                            size="small"
                            value={cartItem.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              handleQuantityChange(cartItem, newQuantity);
                            }}
                            slotProps={{
                              htmlInput: {
                                min: 1,
                                max: cartItem.product.quantity,
                                style: { textAlign: "center", width: "60px" },
                              },
                            }}
                            type="number"
                          />

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(
                                cartItem,
                                cartItem.quantity + 1
                              )
                            }
                            disabled={
                              isLoading ||
                              cartItem.quantity >= cartItem.product.quantity
                            }
                          >
                            <Add />
                          </IconButton>
                        </Box>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", textAlign: "center", mt: 1 }}
                        >
                          Max: {cartItem.product.quantity}
                        </Typography>
                      </Grid>

                      {/* Price and Actions */}
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="h6"
                            color="primary"
                            fontWeight="bold"
                          >
                            $
                            {(
                              cartItem.product.price * cartItem.quantity
                            ).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${cartItem.product.price} each
                          </Typography>

                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(cartItem)}
                            disabled={isLoading}
                            sx={{ mt: 1 }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{ position: "sticky", top: 100 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Order Summary
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1">
                        Subtotal ({cartSummary.itemCount} items)
                      </Typography>
                      <Typography variant="body1">
                        ${cartSummary.subtotal.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Platform Fee ({seedNumber % 10}%)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${cartSummary.platformFee.toFixed(2)}
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 2 }}
                    >
                      Fee calculated from seed: {ASSIGNMENT_SEED} → {seedNumber}{" "}
                      → {seedNumber % 10}%
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ${cartSummary.total.toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartCheckout />}
                    onClick={handleCheckout}
                    disabled={isLoading || cartSummary.isEmpty}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/products")}
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CartPage;
