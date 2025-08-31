import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Store,
} from "@mui/icons-material";

import { productsAPI, queryKeys } from "../../utils/api";
import { formatProductIdWithChecksum } from "../../utils/seedUtils";
import useAuthStore from "../../stores/authStore";
import useActivityStore from "../../stores/activityStore";

const SellerListingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { logPageVisit } = useActivityStore();

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    product: null,
  });
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'

  // Fetch seller's products
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.myListings(),
    queryFn: () => productsAPI.getSellerProducts(),
    enabled: !!user?.id,
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId) => productsAPI.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.myListings(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.products() });
      setDeleteDialog({ open: false, product: null });
    },
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ productId, availability }) =>
      productsAPI.updateProduct(productId, { availability }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.myListings(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.products() });
    },
  });

  useEffect(() => {
    logPageVisit("Seller Listings Page", "/seller/listings");
  }, [logPageVisit]);

  const handleDeleteProduct = async () => {
    if (deleteDialog.product) {
      await deleteProductMutation.mutateAsync(deleteDialog.product.id);
    }
  };

  const handleToggleAvailability = async (product) => {
    await toggleAvailabilityMutation.mutateAsync({
      productId: product.id,
      availability: !product.availability,
    });
  };

  const ProductCard = ({ product }) => (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Qty: {product.quantity}
          </Typography>
          <Chip
            label={product.availability ? "Available" : "Hidden"}
            size="small"
            color={product.availability ? "success" : "default"}
            variant={product.availability ? "filled" : "outlined"}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/products/${product.id}`)}
            title="View Product"
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => navigate(`/seller/edit-product/${product.id}`)}
            title="Edit Product"
          >
            <Edit />
          </IconButton>
        </Box>

        <Box>
          <IconButton
            size="small"
            onClick={() => handleToggleAvailability(product)}
            title={product.availability ? "Hide Product" : "Show Product"}
            disabled={toggleAvailabilityMutation.isPending}
          >
            {product.availability ? <VisibilityOff /> : <Visibility />}
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => setDeleteDialog({ open: true, product })}
            title="Delete Product"
          >
            <Delete />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );

  const ProductTableRow = ({ product }) => (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img
            src={product.images?.[0]?.url || "/placeholder-product.jpg"}
            alt={product.name}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
          <Box>
            <Typography variant="body1" fontWeight="medium">
              {product.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {formatProductIdWithChecksum(product.id)}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>${product.price}</TableCell>
      <TableCell>{product.quantity}</TableCell>
      <TableCell>
        <Chip
          label={product.condition}
          size="small"
          color={product.condition === "New" ? "success" : "default"}
        />
      </TableCell>
      <TableCell>
        <FormControlLabel
          control={
            <Switch
              checked={product.availability}
              onChange={() => handleToggleAvailability(product)}
              disabled={toggleAvailabilityMutation.isPending}
            />
          }
          label={product.availability ? "Available" : "Hidden"}
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => navigate(`/seller/edit-product/${product.id}`)}
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => setDeleteDialog({ open: true, product })}
          >
            <Delete />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/seller")}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            My Listings
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your product listings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/seller/add-product")}
        >
          Add Product
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load products:{" "}
          {error.response?.data?.error || error.message}
        </Alert>
      )}

      {/* View Toggle */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          {productsData?.data?.products?.length || 0} Products
        </Typography>
        <Box>
          <Button
            variant={viewMode === "grid" ? "contained" : "outlined"}
            onClick={() => setViewMode("grid")}
            sx={{ mr: 1 }}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === "table" ? "contained" : "outlined"}
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Products Display */}
      {!isLoading && productsData?.data?.products && (
        <>
          {productsData.data.products.length === 0 ? (
            // Empty state
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <Store sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No products listed yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Start selling by adding your first product to the marketplace
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => navigate("/seller/add-product")}
              >
                Add Your First Product
              </Button>
            </Paper>
          ) : (
            <>
              {viewMode === "grid" ? (
                // Grid View
                <Grid container spacing={3}>
                  {productsData.data.products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // Table View
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Condition</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productsData.data.products.map((product) => (
                        <ProductTableRow key={product.id} product={product} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.product?.name}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, product: null })}
            disabled={deleteProductMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProduct}
            color="error"
            variant="contained"
            disabled={deleteProductMutation.isPending}
            startIcon={
              deleteProductMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <Delete />
              )
            }
          >
            {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerListingsPage;
