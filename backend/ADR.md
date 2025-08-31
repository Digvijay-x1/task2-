# Architecture Decision Record (ADR)
## Marketplace Backend API

**Date:** August 30, 2025  
**Status:** Implemented  
**Assignment Seed:** GHW25-058

---

## Context and Requirements

This document outlines the architectural decisions made for building a reselling marketplace backend API with specific constraints including seed-based authentication, rate limiting, idempotency, and HMAC signatures.

### Key Requirements
- **Assignment Seed Integration:** All security features must use `GHW25-058` as the seed
- **Rate Limiting:** Checkout endpoint limited to 7 requests per minute per IP
- **Idempotency:** Support for idempotency keys with 5-minute replay protection
- **HMAC Signatures:** Checkout responses must include HMAC-SHA256 signatures
- **Deployment:** Special health check and logging endpoints required

---

## Technology Stack Decisions

### 1. **Express.js Framework**
**Decision:** Use Express.js as the web framework  
**Rationale:** 
- Mature, well-documented framework with extensive middleware ecosystem
- Excellent performance for REST APIs
- Strong community support and security practices
- Easy integration with rate limiting and security middleware

### 2. **Prisma ORM with MySQL**
**Decision:** Use Prisma as ORM with MySQL database  
**Rationale:**
- Type-safe database access with excellent TypeScript support
- Automatic migration generation and schema management
- Built-in connection pooling and query optimization
- Strong relationship modeling for marketplace entities
- MySQL chosen for ACID compliance needed for financial transactions

### 3. **JWT Authentication Strategy**
**Decision:** Dual JWT approach - regular JWT for users, seed-based JWT for admins  
**Rationale:**
- Regular JWT with environment secret for standard user authentication
- Assignment seed (`GHW25-058`) used specifically for admin JWT signing/verification
- Cookie-based storage for security (httpOnly, secure flags)
- Role-based access control (RBAC) for Buyer/Seller/Admin permissions

---

## Security Architecture

### 1. **Rate Limiting Strategy**
**Implementation:** express-rate-limit with in-memory store  
**Configuration:**
- Checkout: 7 requests/minute per IP (as required)
- General API: 100 requests/15 minutes per IP
- Production consideration: Redis store recommended for distributed systems

### 2. **Idempotency Implementation**
**Decision:** In-memory Map with 5-minute TTL  
**Rationale:**
- Prevents duplicate charges on checkout retries
- UUID v4 validation for idempotency keys
- Automatic cleanup of expired keys
- Production note: Redis recommended for persistence across restarts

### 3. **HMAC Signature Generation**
**Implementation:** HMAC-SHA256 using ASSIGNMENT_SEED  
**Process:**
1. Generate signature from complete response body
2. Add `X-Signature` header to checkout responses
3. Enables response integrity verification by validators

---

## Database Schema Design

### 1. **User Management**
- **Users:** Support for Buyer/Seller/Admin roles with profile information
- **Authentication:** Secure password hashing with bcrypt

### 2. **Product Catalog**
- **Products:** SKU generation using seed-based checksum algorithm
- **Categories:** Hierarchical organization with product counts
- **Product Images:** Separate table to handle multiple images per product (MySQL limitation)
- **Conditions:** Enum for product condition (New, Used, etc.)

### 3. **Shopping Experience**
- **Cart Items:** User-specific cart with quantity management
- **Favorites:** Like/unlike functionality with duplicate prevention
- **Orders:** Complete transaction history with platform fee calculation

### 4. **Transaction Processing**
- **Orders:** Comprehensive order management with status tracking
- **Order Items:** Snapshot of product details at purchase time
- **Platform Fee:** Calculated as `floor(1.7% of subtotal + 58)` using seed number

---

## API Design Patterns

### 1. **RESTful Design**
- Consistent HTTP methods (GET, POST, PUT, DELETE)
- Logical resource grouping (/products, /cart, /favorites)
- Proper HTTP status codes and error responses

### 2. **Pagination Strategy**
- Cursor-based pagination for large datasets
- Configurable page size with reasonable defaults
- Metadata includes total counts and navigation flags

### 3. **Error Handling**
- Consistent error response format
- Detailed error messages for development
- Security-conscious error messages for production

---

## Security Considerations

### 1. **Input Validation**
- Comprehensive validation for all user inputs
- SQL injection prevention through Prisma ORM
- XSS protection via helmet middleware

### 2. **Authentication & Authorization**
- JWT tokens with appropriate expiration
- Role-based access control throughout API
- Secure cookie configuration for token storage

### 3. **Data Protection**
- Password hashing with bcrypt
- Sensitive data exclusion from API responses
- Request logging with data redaction

---

## Deployment Architecture

### 1. **Health Monitoring**
- Database connectivity checks
- Custom health endpoint with roll number support
- Request logging for debugging and monitoring

### 2. **Scalability Considerations**
- Stateless design for horizontal scaling
- Database indexing for performance
- Cloudinary integration for image storage

---

## Trade-offs and Future Improvements

### Current Limitations
1. **In-memory stores:** Rate limiting and idempotency use memory (Redis recommended for production)
2. **Single-seller orders:** Current implementation assumes one seller per order
3. **Payment integration:** Mock payment processing (real gateway integration needed)

### Future Enhancements
1. **Multi-seller cart support:** Handle orders from multiple sellers
2. **Real-time notifications:** WebSocket integration for order updates
3. **Advanced search:** Elasticsearch for complex product searches
4. **Caching layer:** Redis for frequently accessed data

---

## Conclusion

This architecture provides a robust, secure, and scalable foundation for a marketplace API while meeting all specified requirements including seed-based security features, rate limiting, and deployment constraints. The modular design allows for easy extension and maintenance as the platform grows.
