import express from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  toggleFavorite,
  checkFavoriteStatus
} from '../controllers/favorites.controllers.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// All favorites routes require authentication
router.use(authenticateUser);

router.get('/', getFavorites);
router.post('/:productId', addToFavorites);
router.delete('/:productId', removeFromFavorites);
router.post('/toggle/:productId', toggleFavorite);
router.get('/check/:productId', checkFavoriteStatus);

export default router;
