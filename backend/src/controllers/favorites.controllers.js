import prisma from '../prisma/client.js';

/**
 * Add product to favorites
 * POST /api/v1/favorites/:productId
 */
export const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { id: true, name: true, sellerId: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Users cannot favorite their own products
    if (product.sellerId === userId) {
      return res.status(400).json({ error: 'You cannot favorite your own product' });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        productId: parseInt(productId)
      },
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
      }
    });

    res.status(201).json({
      message: 'Product added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      error: 'Failed to add to favorites',
      details: error.message
    });
  }
};

/**
 * Remove product from favorites
 * DELETE /api/v1/favorites/:productId
 */
export const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if favorite exists
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Product not in favorites' });
    }

    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    res.json({
      message: 'Product removed from favorites'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      error: 'Failed to remove from favorites',
      details: error.message
    });
  }
};

/**
 * Get user's favorite products
 * GET /api/v1/favorites
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [favorites, totalCount] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        skip,
        take,
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
              },
              _count: {
                select: {
                  favorites: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.favorite.count({ where: { userId } })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      favorites,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      error: 'Failed to fetch favorites',
      details: error.message
    });
  }
};

/**
 * Toggle favorite status (add if not favorited, remove if favorited)
 * POST /api/v1/favorites/toggle/:productId
 */
export const toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { id: true, name: true, sellerId: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Users cannot favorite their own products
    if (product.sellerId === userId) {
      return res.status(400).json({ error: 'You cannot favorite your own product' });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId,
            productId: parseInt(productId)
          }
        }
      });

      res.json({
        message: 'Product removed from favorites',
        isFavorited: false
      });
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId,
          productId: parseInt(productId)
        }
      });

      res.json({
        message: 'Product added to favorites',
        isFavorited: true
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      error: 'Failed to toggle favorite',
      details: error.message
    });
  }
};

/**
 * Check if product is favorited by current user
 * GET /api/v1/favorites/check/:productId
 */
export const checkFavoriteStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    res.json({
      isFavorited: !!favorite,
      productId: parseInt(productId)
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      error: 'Failed to check favorite status',
      details: error.message
    });
  }
};
