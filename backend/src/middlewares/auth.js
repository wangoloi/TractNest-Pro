import jwt from 'jsonwebtoken';
import { findUserByUsername } from '../domains/auth/repository.js';

export async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    
    // Get user with organization info
    const user = await findUserByUsername(decoded.username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user and organization info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
}

export function requireOrganization() {
  return (req, res, next) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'Organization context required' });
    }
    next();
  };
}
