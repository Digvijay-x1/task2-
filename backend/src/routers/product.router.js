import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyListings
} from '../controllers/product.controllers.js';
import { authenticateUser, requireSeller, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (with optional auth for favorites)
router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);

// Protected routes - require authentication
router.use(authenticateUser);

// Seller routes - require seller role
router.post('/', requireSeller, createProduct);
router.get('/my/listings', requireSeller, getMyListings);
router.put('/:id', requireSeller, updateProduct);
router.delete('/:id', requireSeller, deleteProduct);

export default router;
