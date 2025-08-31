import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  ShoppingCartCheckout,
  Payment,
  LocalShipping,
  CheckCircle,
  ArrowBack,
} from "@mui/icons-material";

import { checkoutAPI, generateIdempotencyKey } from "../utils/api";
import {
  formatProductIdWithChecksum,
  extractSeedNumber,
  ASSIGNMENT_SEED,
} from "../utils/seedUtils";
import useCartStore from "../stores/cartStore";
import useActivityStore from "../stores/activityStore";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getCartSummary, clearCart } = useCartStore();
  const { logPageVisit, logCheckout } = useActivityStore();

  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  const [shippingData, setShippingData] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const cartSummary = getCartSummary();
  const seedNumber = extractSeedNumber(ASSIGNMENT_SEED);
  const steps = ["Shipping Address", "Review Order", "Payment"];

  useEffect(() => {
    logPageVisit("Checkout Page", "/checkout");

    // Redirect if cart is empty
    if (cartSummary.isEmpty) {
      navigate("/cart");
    }
  }, [logPageVisit, cartSummary.isEmpty, navigate]);

  const handleShippingChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };

  const validateShipping = () => {
    const required = ["fullName", "address", "city", "state", "zipCode"];
    return required.every((field) => shippingData[field].trim() !== "");
  };

  const formatShippingAddress = () => {
    return `${shippingData.fullName}\n${shippingData.address}\n${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}\n${shippingData.country}`;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateShipping()) {
      setError("Please fill in all required shipping fields");
      return;
    }

    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const idempotencyKey = generateIdempotencyKey();
      const checkoutData = {
        shippingAddress: formatShippingAddress(),
        paymentMethod: "pending", // Mock payment for now
      };

      const response = await checkoutAPI.processCheckout(
        checkoutData,
        idempotencyKey
      );

      // Log successful checkout
      logCheckout(cartSummary.total, cartSummary.itemCount);

      // Check for HMAC signature in response headers
      const hmacSignature = response.headers["x-signature"];

      setOrderResult({
        ...response.data,
        hmacSignature,
        idempotencyKey,
      });

      // Clear cart after successful checkout
      clearCart();

      setActiveStep(3); // Success step
    } catch (error) {
      console.error("Checkout error:", error);
      setError(
        error.response?.data?.error || "Checkout failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderShippingForm = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Shipping Address
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={shippingData.fullName}
              onChange={handleShippingChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="address"
              value={shippingData.address}
              onChange={handleShippingChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={shippingData.city}
              onChange={handleShippingChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={shippingData.state}
              onChange={handleShippingChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="ZIP Code"
              name="zipCode"
              value={shippingData.zipCode}
              onChange={handleShippingChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={shippingData.country}
              onChange={handleShippingChange}
              required
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderOrderReview = () => (
    <Grid container spacing={3}>
      {/* Order Items */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>

            <List>
              {items.map((cartItem, index) => (
                <div key={cartItem.id}>
                  <ListItem sx={{ px: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        gap: 2,
                      }}
                    >
                      <img
                        src={
                          cartItem.product.images?.[0]?.url ||
                          "/placeholder-product.jpg"
                        }
                        alt={cartItem.product.name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {cartItem.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {formatProductIdWithChecksum(cartItem.product.id)}{" "}
                          • Qty: {cartItem.quantity}
                        </Typography>
                      </Box>

                      <Typography variant="body1" fontWeight="bold">
                        $
                        {(cartItem.product.price * cartItem.quantity).toFixed(
                          2
                        )}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < items.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
              {formatShippingAddress()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Order Summary */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1">
                  Subtotal ({cartSummary.itemCount} items)
                </Typography>
                <Typography variant="body1">
                  ${cartSummary.subtotal.toFixed(2)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
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
                Seed: {ASSIGNMENT_SEED} → {seedNumber} → {seedNumber % 10}%
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h6" fontWeight="bold">
                Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                ${cartSummary.total.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderOrderSuccess = () => (
    <Paper sx={{ p: 6, textAlign: "center" }}>
      <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Order Placed Successfully!
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Order #{orderResult?.order?.orderNumber}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Chip
          label={`Total: $${orderResult?.order?.total}`}
          color="success"
          size="large"
        />
      </Box>

      {/* HMAC Signature Display */}
      {orderResult?.hmacSignature && (
        <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
          <Typography variant="body2" gutterBottom>
            <strong>HMAC Signature Verified:</strong>
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
          >
            {orderResult.hmacSignature}
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button variant="contained" onClick={() => navigate("/orders")}>
          View Orders
        </Button>
        <Button variant="outlined" onClick={() => navigate("/products")}>
          Continue Shopping
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/cart")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Checkout
        </Typography>
      </Box>

      {/* Stepper */}
      {activeStep < 3 && (
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      {activeStep === 0 && renderShippingForm()}
      {activeStep === 1 && renderOrderReview()}
      {activeStep === 2 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Payment color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Payment Processing
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This is a demo checkout. In a real application, payment processing
            would be integrated here.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            startIcon={
              isProcessing ? (
                <CircularProgress size={20} />
              ) : (
                <ShoppingCartCheckout />
              )
            }
          >
            {isProcessing ? "Processing Order..." : "Place Order"}
          </Button>
        </Paper>
      )}
      {activeStep === 3 && renderOrderSuccess()}

      {/* Navigation Buttons */}
      {activeStep < 2 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            onClick={activeStep === 0 ? () => navigate("/cart") : handleBack}
            startIcon={<ArrowBack />}
          >
            {activeStep === 0 ? "Back to Cart" : "Back"}
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 0 && !validateShipping()}
          >
            {activeStep === 1 ? "Proceed to Payment" : "Next"}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CheckoutPage;
