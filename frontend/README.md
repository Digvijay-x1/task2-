# 🛍️ Marketplace Frontend

A modern React-based marketplace frontend with Material-UI design, built with assignment seed integration and comprehensive marketplace features.

## 🎯 **Assignment Seed Integration**

**Assignment Seed:** `FRONT25-058`

### ✅ **Mandatory Requirements Implemented:**

1. **Seed Display on /about Page**
   - ✅ Styled component showing `FRONT25-058`
   - ✅ Dynamic color theme generated from seed
   - ✅ Graceful fallback if seed is missing

2. **Dynamic Behaviors**
   - ✅ Platform fee: `(58 % 10)% = 8%` of subtotal
   - ✅ Product IDs with seed-based checksum digits
   - ✅ Color theme generated from seed hash

3. **Deployment Routes**
   - ✅ `/IEC2024058/healthz` - Frontend health check
   - ✅ `/logs/recent` - Last 20 user actions

## 🚀 **Features Implemented**

### **Core Marketplace Features:**
- ✅ **Product Display** - Responsive product browsing with pagination
- ✅ **Shopping Cart** - Add/remove items with seed-based platform fee
- ✅ **Dynamic Feed** - Homepage with latest listings and categories
- ✅ **Product Search** - Search by keyword, category, price, location
- ✅ **Product Details** - Detailed product pages with seller info
- ✅ **Favorites System** - Like/bookmark products for later
- ✅ **Seller Profiles** - Seller dashboard and profile pages
- ✅ **Seamless Checkout** - Multi-step checkout with HMAC verification

### **Enhanced Features:**
- ✅ **Smart Pagination** - 12 items per page with navigation
- ✅ **Advanced Filters** - Price range, condition, location filters
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Responsive Design** - Mobile-first responsive layout
- ✅ **Smooth Animations** - Hover effects and transitions

## 🛠️ **Technology Stack**

- **React 18** - Modern React with hooks
- **Material-UI (MUI)** - Professional design system
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## 🔧 **Setup Instructions**

### **Prerequisites:**
- Node.js 18+ and npm
- Backend API running on `http://localhost:3000`

### **Installation:**

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Open Browser:**
   ```
   http://localhost:5173
   ```

## 🧪 **Testing the Application**

### **Required Endpoints to Test:**

1. **Assignment Seed Display:**
   ```
   http://localhost:5173/about
   ```

2. **Health Check (Roll Number):**
   ```
   http://localhost:5173/IEC2024058/healthz
   ```

3. **Activity Logs:**
   ```
   http://localhost:5173/logs/recent
   ```

### **Demo User Accounts:**
- **Buyer:** `buyer@marketplace.com` / `buyer123`
- **Seller:** `seller@marketplace.com` / `seller123`
- **Admin:** `admin@marketplace.com` / `admin123`

## 🎨 **Seed-Based Features**

### **Color Theme Generation:**
The entire Material-UI theme is dynamically generated from `FRONT25-058`:
- **Primary Color:** Generated from seed hash
- **Accent Color:** Complementary color calculation
- **HSL Values:** Consistent saturation and lightness

### **Platform Fee Calculation:**
```javascript
// Seed: FRONT25-058 → Extract: 58 → Fee: 58 % 10 = 8%
const platformFee = subtotal * 0.08;
```

### **Product ID Checksums:**
```javascript
// Product ID: 123 → Display: 123-7 (checksum from seed)
const displayId = formatProductIdWithChecksum(productId);
```

## 🚀 **Deployment Ready!**

**Assignment Seed:** FRONT25-058
**Roll Number:** IEC2024058
**Platform Fee:** 8% (from seed 58 % 10)
