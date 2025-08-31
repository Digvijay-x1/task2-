# Marketplace Backend API

A comprehensive reselling marketplace backend built with Express.js, featuring authentication, product management, shopping cart, and secure checkout with assignment seed integration.

## 🚀 Features

- **User Authentication & Authorization** (JWT-based with role management)
- **Product Management** (CRUD operations with SKU generation)
- **Shopping Cart System** (Add, update, remove items)
- **Favorites/Likes System** (Like/unlike products)
- **Secure Checkout** (Rate limiting, idempotency, HMAC signatures)
- **Category Management** (Product categorization)
- **Order Management** (Transaction history and status tracking)
- **Assignment Seed Integration** (`GHW25-058`)

## 🛠️ Technology Stack

- **Framework:** Express.js
- **Database:** MySQL with Prisma ORM
- **Authentication:** JWT with bcrypt password hashing
- **File Storage:** Cloudinary for image uploads
- **Security:** Helmet, CORS, Rate limiting
- **Validation:** Custom middleware with comprehensive error handling

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL database
- pnpm package manager
- Cloudinary account (for image uploads)

## ⚙️ Environment Setup

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="mysql://username:password@host:port/database"

# JWT Secret (for regular user authentication)
JWT_SECRET="your-jwt-secret-key"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

## 🚀 Installation & Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up database:**
   ```bash
   npx prisma migrate dev
   ```

3. **Seed initial data:**
   ```bash
   node prisma/seed.js
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 🔐 Assignment Seed Integration (GHW25-058)

### Key Features:
1. **Admin JWT Signing:** Admin tokens signed with `GHW25-058`
2. **SKU Generation:** Product SKUs include checksum derived from seed
3. **Platform Fee:** Calculated as `floor(1.7% of subtotal + 58)`
4. **HMAC Signatures:** Checkout responses signed with seed

### Seed Utilities:
```javascript
import { 
  generateSKU, 
  calculatePlatformFee, 
  signAdminJWT, 
  generateHMACSignature 
} from './src/lib/seedUtils.js';
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - User logout
- `PUT /api/v1/auth/profile` - Update user profile

### Products
- `GET /api/v1/products` - Get products (with pagination & filters)
- `POST /api/v1/products` - Create product (Seller only)
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product (Owner/Admin only)
- `DELETE /api/v1/products/:id` - Delete product (Owner/Admin only)
- `GET /api/v1/products/my/listings` - Get seller's products

### Shopping Cart
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/:id` - Update cart item quantity
- `DELETE /api/v1/cart/:id` - Remove item from cart
- `DELETE /api/v1/cart/clear/all` - Clear entire cart

### Favorites
- `GET /api/v1/favorites` - Get user's favorites
- `POST /api/v1/favorites/:productId` - Add to favorites
- `DELETE /api/v1/favorites/:productId` - Remove from favorites
- `POST /api/v1/favorites/toggle/:productId` - Toggle favorite status

### Checkout & Orders
- `POST /api/v1/checkout` - Process checkout ⚠️ **Rate Limited (7/min)**
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id/status` - Update order status (Seller/Admin)

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category (Admin only)
- `GET /api/v1/categories/:id` - Get category with products
- `PUT /api/v1/categories/:id` - Update category (Admin only)
- `DELETE /api/v1/categories/:id` - Delete category (Admin only)

### System Routes
- `GET /:IEC2024058/healthz` - Health check with roll number
- `GET /logs/recent` - Recent request logs (last 50, redacted)

## 🔒 Security Features

### Rate Limiting
- **Checkout:** 7 requests per minute per IP
- **General API:** 100 requests per 15 minutes per IP

### Idempotency
- **Header:** `Idempotency-Key` (required for checkout)
- **Format:** UUID v4 or unique identifier (16-128 chars)
- **TTL:** 5 minutes for replay protection

### HMAC Signatures
- **Header:** `X-Signature` (added to checkout responses)
- **Algorithm:** HMAC-SHA256 with ASSIGNMENT_SEED
- **Purpose:** Response integrity verification

## 🧪 Testing

### Sample Users (created by seed script):
```
Admin:  admin@marketplace.com  / admin123
Seller: seller@marketplace.com / seller123
Buyer:  buyer@marketplace.com  / buyer123
```

### Test Checkout Flow:
1. **Login as buyer:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"buyer@marketplace.com","password":"buyer123"}'
   ```

2. **Add product to cart:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/cart/add \
     -H "Content-Type: application/json" \
     -H "Cookie: jwt=YOUR_JWT_TOKEN" \
     -d '{"productId":1,"quantity":1}'
   ```

3. **Process checkout with idempotency:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/checkout \
     -H "Content-Type: application/json" \
     -H "Cookie: jwt=YOUR_JWT_TOKEN" \
     -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
     -d '{"shippingAddress":"123 Main St, City, State 12345"}'
   ```

### Test Special Routes:
```bash
# Health check
curl http://localhost:3000/IEC2024058/healthz

# Recent logs
curl http://localhost:3000/logs/recent
```

## 📊 Database Schema

### Core Models:
- **User:** Authentication and profile management
- **Product:** Marketplace listings with seed-based SKUs
- **Category:** Product categorization
- **CartItem:** Shopping cart management
- **Favorite:** User likes/favorites
- **Order:** Transaction records with platform fees
- **OrderItem:** Order line items with price snapshots
- **ProductImage:** Multiple images per product

### Key Relationships:
- Users can be Buyers, Sellers, or Admins
- Sellers can list multiple products
- Products belong to categories and have multiple images
- Users can favorite products and add them to cart
- Orders capture complete transaction details

## 🚀 Deployment

### Required Environment Variables:
```env
DATABASE_URL=mysql://...
JWT_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
NODE_ENV=production
```

### Deployment Checklist:
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Health check endpoint accessible at `/:IEC2024058/healthz`
- [ ] Logs endpoint accessible at `/logs/recent`
- [ ] CORS configured for frontend domain
- [ ] Rate limiting active
- [ ] HMAC signatures working on checkout

## 🔧 Development

### Available Scripts:
- `npm run dev` - Start development server with nodemon
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio for database management
- `node prisma/seed.js` - Seed database with initial data

### Code Structure:
```
src/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── routers/         # Route definitions
├── lib/             # Utility functions
├── prisma/          # Database client
└── server.js        # Main application file
```

## 📝 API Documentation

Complete API documentation is available in `openapi.yaml`. Key features:
- Comprehensive endpoint documentation
- Request/response schemas
- Authentication requirements
- Rate limiting information
- Error response formats

---

**Assignment Seed:** GHW25-058  
**Platform Fee Formula:** floor(1.7% of subtotal + 58)  
**Rate Limit:** 7 checkout requests per minute per IP  
**Idempotency:** 5-minute replay protection  
**HMAC:** SHA256 signature with assignment seed
