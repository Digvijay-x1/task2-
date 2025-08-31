import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Assignment seed provided in requirements
export const ASSIGNMENT_SEED = 'GHW25-058';

/**
 * Extract numeric value from assignment seed for calculations
 * GHW25-058 -> extract 58 as the numeric component
 */
export function extractSeedNumber(seed = ASSIGNMENT_SEED) {
  const match = seed.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate SKU with checksum derived from ASSIGNMENT_SEED
 * Format: PROD-{timestamp}-{checksum}
 */
export function generateSKU(productData) {
  const timestamp = Date.now();
  const dataString = JSON.stringify({
    name: productData.name,
    price: productData.price,
    sellerId: productData.sellerId,
    timestamp
  });
  
  // Create checksum using ASSIGNMENT_SEED
  const checksum = crypto
    .createHmac('sha256', ASSIGNMENT_SEED)
    .update(dataString)
    .digest('hex')
    .substring(0, 8); // Take first 8 characters
  
  return `PROD-${timestamp}-${checksum}`;
}

/**
 * Calculate platform fee using ASSIGNMENT_SEED
 * Formula: floor(1.7% of subtotal + n from seed)
 */
export function calculatePlatformFee(subtotal) {
  const seedNumber = extractSeedNumber();
  const feePercentage = 0.017; // 1.7%
  const fee = Math.floor(subtotal * feePercentage + seedNumber);
  return fee;
}

/**
 * Sign admin JWT with ASSIGNMENT_SEED
 */
export function signAdminJWT(payload, expiresIn = '1d') {
  return jwt.sign(payload, ASSIGNMENT_SEED, { expiresIn });
}

/**
 * Verify admin JWT with ASSIGNMENT_SEED
 */
export function verifyAdminJWT(token) {
  try {
    return jwt.verify(token, ASSIGNMENT_SEED);
  } catch (error) {
    throw new Error('Invalid admin token');
  }
}

/**
 * Generate HMAC signature for checkout responses
 */
export function generateHMACSignature(responseBody) {
  const bodyString = typeof responseBody === 'string' 
    ? responseBody 
    : JSON.stringify(responseBody);
    
  return crypto
    .createHmac('sha256', ASSIGNMENT_SEED)
    .update(bodyString)
    .digest('hex');
}

/**
 * Generate unique order number
 */
export function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random.toUpperCase()}`;
}

/**
 * Validate idempotency key format
 */
export function isValidIdempotencyKey(key) {
  // Should be a UUID v4 format or similar unique identifier
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(key) || (key && key.length >= 16 && key.length <= 128);
}
