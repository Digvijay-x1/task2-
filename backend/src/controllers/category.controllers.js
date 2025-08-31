import prisma from '../prisma/client.js';

/**
 * Create a new category (Admin only)
 * POST /api/v1/categories
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      error: 'Failed to create category',
      details: error.message
    });
  }
};

/**
 * Get all categories
 * GET /api/v1/categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: {
                availability: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
};

/**
 * Get category by ID with products
 * GET /api/v1/categories/:id
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get products in this category with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: {
          categoryId: parseInt(id),
          availability: true
        },
        skip,
        take,
        include: {
          seller: {
            select: { id: true, name: true, location: true }
          },
          images: {
            where: { isPrimary: true },
            take: 1
          },
          _count: {
            select: {
              favorites: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({
        where: {
          categoryId: parseInt(id),
          availability: true
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      category,
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
    console.error('Error fetching category:', error);
    res.status(500).json({
      error: 'Failed to fetch category',
      details: error.message
    });
  }
};

/**
 * Update category (Admin only)
 * PUT /api/v1/categories/:id
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (name && name !== existingCategory.name) {
      const nameConflict = await prisma.category.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      error: 'Failed to update category',
      details: error.message
    });
  }
};

/**
 * Delete category (Admin only)
 * DELETE /api/v1/categories/:id
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (existingCategory._count.products > 0) {
      return res.status(400).json({
        error: `Cannot delete category. ${existingCategory._count.products} products are still using this category.`
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      error: 'Failed to delete category',
      details: error.message
    });
  }
};
