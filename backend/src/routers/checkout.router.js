import express from 'express';
import {
  processCheckout,
  getOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/checkout.controllers.js';
import { authenticateUser, requireSeller } from '../middleware/auth.middleware.js';
import { 
  checkoutRateLimit, 
  handleIdempotency, 
  addHMACSignature 
} from '../middleware/security.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Checkout route with special middleware
router.post(
  '/checkout',
  checkoutRateLimit,        // Rate limit: 7 requests per minute per IP
  handleIdempotency,        // Handle idempotency keys
  addHMACSignature,         // Add HMAC signature to response
  processCheckout
);

// Order management routes
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);

// Seller/Admin only routes
router.put('/orders/:id/status', requireSeller, updateOrderStatus);

export default router;
