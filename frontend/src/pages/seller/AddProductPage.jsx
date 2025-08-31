import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Chip,
} from "@mui/material";
import { ArrowBack, Add, CloudUpload, Delete, Save } from "@mui/icons-material";

import { productsAPI, categoriesAPI, queryKeys } from "../../utils/api";
import useAuthStore from "../../stores/authStore";
import useActivityStore from "../../stores/activityStore";

const AddProductPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { logPageVisit } = useActivityStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    condition: "",
    categoryId: "",
    quantity: 1,
    sku: "",
    availability: true,
  });

  const [images, setImages] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesAPI.getCategories(),
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (productData) => productsAPI.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
      navigate("/seller");
    },
  });

  useEffect(() => {
    logPageVisit("Add Product Page", "/seller/add-product");
  }, [logPageVisit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "Valid price is required";
    }

    if (!formData.condition) {
      errors.condition = "Condition is required";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Category is required";
    }

    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      errors.quantity = "Quantity must be at least 1";
    }

    if (images.length === 0) {
      errors.images = "At least one image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to compress and convert file to base64
  const compressAndConvertImage = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality
        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessingImages(true);

      // Compress and convert images to base64
      const imagePromises = images.map((image) =>
        compressAndConvertImage(image.file)
      );
      const base64Images = await Promise.all(imagePromises);

      setIsProcessingImages(false);

      // Prepare data for submission
      const submitData = {
        ...formData,
        images: base64Images,
      };

      await createProductMutation.mutateAsync(submitData);
    } catch (error) {
      setIsProcessingImages(false);
      console.error("Failed to create product:", error);
    }
  };

  const conditionOptions = ["New", "Like New", "Good", "Fair", "Poor", "Used"];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/seller")}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Add New Product
          </Typography>
          <Typography variant="h6" color="text.secondary">
            List a new item for sale on the marketplace
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {createProductMutation.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {createProductMutation.error.response?.data?.error ||
            "Failed to create product"}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  error={!!formErrors.quantity}
                  helperText={formErrors.quantity}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.condition}>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    label="Condition"
                  >
                    {conditionOptions.map((condition) => (
                      <MenuItem key={condition} value={condition}>
                        {condition}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.condition && (
                    <Typography variant="caption" color="error">
                      {formErrors.condition}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.categoryId}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categoriesData?.data?.categories?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.categoryId && (
                    <Typography variant="caption" color="error">
                      {formErrors.categoryId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SKU (Optional)"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  helperText="Leave blank to auto-generate"
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Product Images
                </Typography>

                <Paper
                  sx={{
                    p: 3,
                    border: "2px dashed",
                    borderColor: formErrors.images ? "error.main" : "grey.300",
                    textAlign: "center",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <CloudUpload
                    sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="body1" gutterBottom>
                    Click to upload images or drag and drop
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PNG, JPG, GIF up to 10MB each
                  </Typography>
                </Paper>

                {formErrors.images && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {formErrors.images}
                  </Typography>
                )}

                {/* Image Preview */}
                {images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Uploaded Images ({images.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {images.map((image) => (
                        <Grid item xs={6} sm={4} md={3} key={image.id}>
                          <Paper sx={{ p: 1, position: "relative" }}>
                            <img
                              src={image.url}
                              alt="Product"
                              style={{
                                width: "100%",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeImage(image.id)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                bgcolor: "background.paper",
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/seller")}
                    disabled={
                      createProductMutation.isPending || isProcessingImages
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={
                      createProductMutation.isPending || isProcessingImages ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Save />
                      )
                    }
                    disabled={
                      createProductMutation.isPending || isProcessingImages
                    }
                  >
                    {isProcessingImages
                      ? "Processing Images..."
                      : createProductMutation.isPending
                      ? "Creating Product..."
                      : "Create Product"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddProductPage;
