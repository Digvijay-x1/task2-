import rateLimit from "express-rate-limit";
import {
  generateHMACSignature,
  isValidIdempotencyKey,
} from "../lib/seedUtils.js";

// Store for idempotency keys (in production, use Redis)
const idempotencyStore = new Map();

/**
 * Rate limiter for checkout endpoint - 7 requests per minute per IP
 */
export const checkoutRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 7, // 7 requests per minute per IP
  message: {
    error: "Too many checkout requests. Please try again later.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Remove custom keyGenerator to use default IP handling
});

/**
 * General API rate limiter
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: {
    error: "Too many requests. Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Middleware to handle idempotency keys for checkout
 */
export const handleIdempotency = (req, res, next) => {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return res.status(400).json({
      error: "Idempotency-Key header is required for checkout requests",
    });
  }

  if (!isValidIdempotencyKey(idempotencyKey)) {
    return res.status(400).json({
      error:
        "Invalid Idempotency-Key format. Must be a valid UUID or unique identifier.",
    });
  }

  // Check if this idempotency key was used recently (within 5 minutes)
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  // Clean up old entries
  for (const [key, data] of idempotencyStore.entries()) {
    if (data.timestamp < fiveMinutesAgo) {
      idempotencyStore.delete(key);
    }
  }

  // Check if key exists and is still valid
  if (idempotencyStore.has(idempotencyKey)) {
    const storedData = idempotencyStore.get(idempotencyKey);

    // Return the same response as before
    return res.status(storedData.statusCode).json(storedData.response);
  }

  // Store the key for this request
  req.idempotencyKey = idempotencyKey;

  // Override res.json to store the response
  const originalJson = res.json;
  res.json = function (data) {
    // Store the response for future idempotent requests
    idempotencyStore.set(idempotencyKey, {
      statusCode: res.statusCode,
      response: data,
      timestamp: now,
    });

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Middleware to add HMAC signature to checkout responses
 */
export const addHMACSignature = (req, res, next) => {
  // Override res.json to add HMAC signature
  const originalJson = res.json;

  res.json = function (data) {
    // Generate HMAC signature for the response body
    const signature = generateHMACSignature(data);

    // Add X-Signature header
    res.setHeader("X-Signature", signature);

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Request logging middleware for /logs/recent endpoint
 */
const requestLogs = [];
const MAX_LOGS = 50;

export const logRequests = (req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id || null,
    // Redact sensitive information
    body: req.method === "POST" ? "[REDACTED]" : undefined,
  };

  // Add to logs array, keeping only the last 50
  requestLogs.push(logEntry);
  if (requestLogs.length > MAX_LOGS) {
    requestLogs.shift();
  }

  next();
};

/**
 * Get recent request logs (redacted)
 */
export const getRecentLogs = () => {
  return requestLogs.slice(-MAX_LOGS);
};
