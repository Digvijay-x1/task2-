import prisma from '../prisma/client.js';

/**
 * TO Add item to cart
 * POST /api/v1/cart/add
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Check if product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: {
        seller: {
          select: { id: true, name: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.availability) {
      return res.status(400).json({ error: 'Product is not available' });
    }

    if (product.sellerId === userId) {
      return res.status(400).json({ error: 'You cannot add your own product to cart' });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({
        error: `Only ${product.quantity} items available in stock`
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + parseInt(quantity);
      
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          error: `Cannot add ${quantity} more items. Only ${product.quantity - existingCartItem.quantity} more available.`
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              seller: {
                select: { id: true, name: true }
              },
              category: true,
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        },
        include: {
          product: {
            include: {
              seller: {
                select: { id: true, name: true }
              },
              category: true,
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        }
      });
    }

    res.status(201).json({
      message: 'Item added to cart successfully',
      cartItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      error: 'Failed to add item to cart',
      details: error.message
    });
  }
};

/**
 * Get user cart
 * GET /api/v1/cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, name: true, location: true }
            },
            category: true,
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate cart totals
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    res.json({
      cartItems,
      summary: {
        itemCount,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalItems: cartItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      error: 'Failed to fetch cart',
      details: error.message
    });
  }
};

/**
 * Update cart item quantity
 * PUT /api/v1/cart/:id
 */
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own cart items' });
    }

    if (quantity > cartItem.product.quantity) {
      return res.status(400).json({
        error: `Only ${cartItem.product.quantity} items available in stock`
      });
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: parseInt(quantity) },
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, name: true }
            },
            category: true,
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      }
    });

    res.json({
      message: 'Cart item updated successfully',
      cartItem: updatedCartItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      error: 'Failed to update cart item',
      details: error.message
    });
  }
};

/**
 * Remove item from cart
 * DELETE /api/v1/cart/:id
 */
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.userId !== userId) {
      return res.status(403).json({ error: 'You can only remove your own cart items' });
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      error: 'Failed to remove item from cart',
      details: error.message
    });
  }
};

/**
 * Clear entire cart
 * DELETE /api/v1/cart/clear
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      error: 'Failed to clear cart',
      details: error.message
    });
  }
};
