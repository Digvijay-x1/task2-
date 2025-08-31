# 🚀 Deployment Guide - Marketplace API

## ✅ Pre-Deployment Checklist

### Core Requirements Implemented:
- [x] **Assignment Seed Integration** (`GHW25-058`)
  - JWT signing/verification for admin tokens
  - SKU generation with seed-based checksum
  - Platform fee calculation: `floor(1.7% of subtotal + 58)`
  - HMAC signatures for checkout responses

- [x] **Rate Limiting & Security**
  - Checkout endpoint: 7 requests per minute per IP
  - General API rate limiting: 100 requests per 15 minutes
  - Idempotency key support (5-minute TTL)
  - HMAC-SHA256 signatures on checkout responses

- [x] **Complete Marketplace Features**
  - User authentication & authorization (Buyer/Seller/Admin)
  - Product management with pagination & filters
  - Shopping cart functionality
  - Favorites/likes system
  - Secure checkout with transaction processing
  - Category management
  - Order history and status tracking

- [x] **Special Deployment Routes**
  - `/:IEC2024058/healthz` - Health check with roll number
  - `/logs/recent` - Last 50 requests (redacted)

- [x] **Documentation**
  - OpenAPI YAML specification
  - Architecture Decision Record (ADR)
  - Comprehensive README with setup instructions

## 🌐 Deployment Steps

### 1. Choose Deployment Platform
Recommended free platforms:
- **Render** (recommended)
- **Railway**
- **Fly.io**
- **Heroku**

### 2. Environment Variables
Set these in your deployment platform:
```env
DATABASE_URL=mysql://username:password@host:port/database
JWT_SECRET=your-secure-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
```

### 3. Database Setup
```bash
# Run migrations on production database
npx prisma migrate deploy

# Seed initial data
node prisma/seed.js
```

### 4. Build Commands
```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Start production server
node src/server.js
```

## 🧪 Post-Deployment Testing

### Required Endpoint Tests:
```bash
# Health check with roll number
curl https://your-api-domain.com/IEC2024058/healthz

# Recent logs
curl https://your-api-domain.com/logs/recent

# Categories (public)
curl https://your-api-domain.com/api/v1/categories

# Products (public)
curl https://your-api-domain.com/api/v1/products
```

### Authentication Test:
```bash
# Login as test user
curl -X POST https://your-api-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@marketplace.com","password":"buyer123"}'
```

### Checkout Test (with rate limiting):
```bash
# Test checkout with idempotency key
curl -X POST https://your-api-domain.com/api/v1/checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_JWT_TOKEN" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{"shippingAddress":"123 Test St, City, State 12345"}'
```

## 🔍 Validation Points

### Assignment Seed Validation:
1. **SKU Format:** `PROD-{timestamp}-{checksum}` where checksum uses GHW25-058
2. **Platform Fee:** Should be `floor(1.7% of subtotal + 58)`
3. **HMAC Signature:** `X-Signature` header on checkout responses
4. **Admin JWT:** Signed with GHW25-058 seed

### Security Validation:
1. **Rate Limiting:** Checkout limited to 7 requests per minute
2. **Idempotency:** Duplicate requests within 5 minutes return same response
3. **Authentication:** Protected endpoints require valid JWT
4. **RBAC:** Role-based access control enforced

## 📊 Sample Data

The seed script creates:
- **3 Test Users:**
  - Admin: `admin@marketplace.com` / `admin123`
  - Seller: `seller@marketplace.com` / `seller123`
  - Buyer: `buyer@marketplace.com` / `buyer123`

- **8 Categories:**
  - Electronics, Fashion, Home & Garden, Sports & Outdoors
  - Books & Media, Toys & Games, Automotive, Health & Beauty

## 🎯 Success Criteria

- [ ] All endpoints respond correctly
- [ ] Assignment seed features validated
- [ ] Rate limiting enforced on checkout
- [ ] HMAC signatures present on checkout responses
- [ ] Health check accessible at `/:IEC2024058/healthz`
- [ ] Logs accessible at `/logs/recent`
- [ ] Database migrations applied successfully
- [ ] Authentication and RBAC working
- [ ] OpenAPI documentation accurate

## 🚨 Troubleshooting

### Common Issues:
1. **Database Connection:** Verify DATABASE_URL format and credentials
2. **CORS Errors:** Ensure FRONTEND_URL is set correctly
3. **JWT Issues:** Check JWT_SECRET is set and consistent
4. **Cloudinary Errors:** Verify all Cloudinary credentials
5. **Rate Limiting:** May need Redis for production scaling

### Debug Commands:
```bash
# Check database connection
npx prisma studio

# View recent migrations
npx prisma migrate status

# Reset database (if needed)
npx prisma migrate reset
```

---

**🎉 Deployment Ready!**  
Your marketplace API is fully implemented with all required features and ready for deployment.

**Assignment Seed:** GHW25-058  
**API Version:** 1.0.0  
**Documentation:** See `openapi.yaml` and `ADR.md`
