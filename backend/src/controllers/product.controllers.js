import prisma from '../prisma/client.js';
import { generateSKU } from '../lib/seedUtils.js';
import cloudinary from '../config/cloudinary.config.js';

/**
 * Create a new product listing
 * POST /api/v1/products
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, condition, quantity, categoryId, images } = req.body;
    const sellerId = req.user.id;

    // Validate required fields
    if (!name || !price || !categoryId) {
      return res.status(400).json({
        error: 'Name, price, and category are required'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        error: 'Price must be greater than 0'
      });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      return res.status(400).json({
        error: 'Invalid category ID'
      });
    }

    // Generate SKU using ASSIGNMENT_SEED
    const sku = generateSKU({
      name,
      price: parseFloat(price),
      sellerId
    });

    // Create product
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        price: parseFloat(price),
        condition: condition || 'Used',
        quantity: parseInt(quantity) || 1,
        sellerId,
        categoryId: parseInt(categoryId)
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true
          }
        },
        category: true,
        images: true
      }
    });

    // Handle image uploads if provided
    if (images && Array.isArray(images) && images.length > 0) {
      const imagePromises = images.map(async (imageData, index) => {
        try {
          const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'marketplace_products',
            timeout: 60000
          });

          return prisma.productImage.create({
            data: {
              url: uploadResult.secure_url,
              altText: `${name} - Image ${index + 1}`,
              isPrimary: index === 0,
              productId: product.id
            }
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return null;
        }
      });

      await Promise.all(imagePromises);
    }

    // Fetch the complete product with images
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true
          }
        },
        category: true,
        images: true
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: completeProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      error: 'Failed to create product',
      details: error.message
    });
  }
};

/**
 * Get all products with pagination and filters
 * GET /api/v1/products
 */
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      condition,
      location,
      sellerId
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause for filtering
    const where = {
      availability: true
    };

    if (category) {
      where.categoryId = parseInt(category);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (condition) {
      where.condition = condition;
    }

    if (location) {
      where.seller = {
        location: { contains: location }
      };
    }

    if (sellerId) {
      where.sellerId = parseInt(sellerId);
    }

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          category: true,
          images: {
            orderBy: { isPrimary: 'desc' }
          },
          _count: {
            select: {
              favorites: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      details: error.message
    });
  }
};

/**
 * Get single product by ID
 * GET /api/v1/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            contactInfo: true
          }
        },
        category: true,
        images: {
          orderBy: { isPrimary: 'desc' }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if current user has favorited this product
    let isFavorited = false;
    if (req.user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId: req.user.id,
            productId: product.id
          }
        }
      });
      isFavorited = !!favorite;
    }

    res.json({
      ...product,
      isFavorited
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      details: error.message
    });
  }
};

/**
 * Update product (only by seller or admin)
 * PUT /api/v1/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, condition, quantity, availability } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the product
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user owns this product or is admin
    if (existingProduct.sellerId !== userId && userRole !== 'Admin') {
      return res.status(403).json({
        error: 'You can only update your own products'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (condition !== undefined) updateData.condition = condition;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (availability !== undefined) updateData.availability = Boolean(availability);

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        category: true,
        images: true
      }
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Failed to update product',
      details: error.message
    });
  }
};

/**
 * Delete product (only by seller or admin)
 * DELETE /api/v1/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the product
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user owns this product or is admin
    if (existingProduct.sellerId !== userId && userRole !== 'Admin') {
      return res.status(403).json({
        error: 'You can only delete your own products'
      });
    }

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      error: 'Failed to delete product',
      details: error.message
    });
  }
};

/**
 * Get products by current user (seller's listings)
 * GET /api/v1/products/my-listings
 */
export const getMyListings = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId },
        skip,
        take,
        include: {
          category: true,
          images: {
            orderBy: { isPrimary: 'desc' }
          },
          _count: {
            select: {
              favorites: true,
              cartItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where: { sellerId } })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({
      error: 'Failed to fetch your listings',
      details: error.message
    });
  }
};
