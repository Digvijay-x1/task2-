import jwt from 'jsonwebtoken';
import ENV from '../config/env.config.js';
import prisma from '../prisma/client.js';
import { verifyAdminJWT } from '../lib/seedUtils.js';

/**
 * Middleware to authenticate users using JWT from cookies
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token using regular JWT secret
    const decoded = jwt.verify(token, ENV.JWT);
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        location: true,
        contactInfo: true,
        profilePicture: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Middleware to authenticate admin users using ASSIGNMENT_SEED
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.adminJwt;
    
    if (!token) {
      return res.status(401).json({ error: 'Admin access denied. No token provided.' });
    }

    // Verify admin token using ASSIGNMENT_SEED
    const decoded = verifyAdminJWT(token);
    
    // Fetch user and verify admin role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access denied. Insufficient privileges.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    return res.status(401).json({ error: 'Invalid admin token.' });
  }
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role(s): ${userRoles.join(', ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is seller or admin
 */
export const requireSeller = requireRole(['Seller', 'Admin']);

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['Admin']);

/**
 * Optional authentication - sets req.user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (token) {
      const decoded = jwt.verify(token, ENV.JWT);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          location: true,
          contactInfo: true,
          profilePicture: true
        }
      });
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error.message);
  }
  
  next();
};
