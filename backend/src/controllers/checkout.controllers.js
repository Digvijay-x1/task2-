import prisma from '../prisma/client.js';
import { calculatePlatformFee, generateOrderNumber, generateHMACSignature } from '../lib/seedUtils.js';

/**
 * Process checkout
 * POST /api/v1/checkout
 */
export const processCheckout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;
    const idempotencyKey = req.idempotencyKey; // Set by middleware

    // Validate required fields
    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate product availability and stock
    for (const item of cartItems) {
      if (!item.product.availability) {
        return res.status(400).json({
          error: `Product "${item.product.name}" is no longer available`
        });
      }

      if (item.quantity > item.product.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${item.product.name}". Only ${item.product.quantity} available.`
        });
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    const platformFee = calculatePlatformFee(subtotal);
    const total = subtotal + platformFee;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Group items by seller for potential multi-seller support
    const sellerGroups = cartItems.reduce((groups, item) => {
      const sellerId = item.product.sellerId;
      if (!groups[sellerId]) {
        groups[sellerId] = [];
      }
      groups[sellerId].push(item);
      return groups;
    }, {});

    // For now, we'll create one order (can be extended for multi-seller)
    const primarySellerId = Object.keys(sellerGroups)[0];

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          subtotal: parseFloat(subtotal.toFixed(2)),
          platformFee: parseFloat(platformFee.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          buyerId: userId,
          sellerId: parseInt(primarySellerId),
          shippingAddress,
          idempotencyKey,
          status: 'Pending'
        }
      });

      // Create order items
      const orderItems = await Promise.all(
        cartItems.map(item =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price // Lock in current price
            }
          })
        )
      );

      // Update product quantities
      await Promise.all(
        cartItems.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          })
        )
      );

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return { order, orderItems };
    });

    // Prepare response
    const responseData = {
      message: 'Checkout successful',
      order: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        subtotal: result.order.subtotal,
        platformFee: result.order.platformFee,
        total: result.order.total,
        shippingAddress: result.order.shippingAddress,
        createdAt: result.order.createdAt
      },
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      })),
      payment: {
        method: paymentMethod || 'pending',
        status: 'pending'
      }
    };

    // The HMAC signature will be added by middleware
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({
      error: 'Failed to process checkout',
      details: error.message
    });
  }
};

/**
 * Get user's order history
 * GET /api/v1/orders
 */
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { buyerId: userId };
    if (status) {
      where.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      details: error.message
    });
  }
};

/**
 * Get single order by ID
 * GET /api/v1/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has access to this order
    const hasAccess = order.buyerId === userId || 
                     order.sellerId === userId || 
                     userRole === 'Admin';

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this order' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      details: error.message
    });
  }
};

/**
 * Update order status (seller or admin only)
 * PUT /api/v1/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
      });
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: {
          select: { id: true, name: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has permission to update this order
    const canUpdate = order.sellerId === userId || userRole === 'Admin';

    if (!canUpdate) {
      return res.status(403).json({
        error: 'You can only update orders for your own products'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      details: error.message
    });
  }
};
