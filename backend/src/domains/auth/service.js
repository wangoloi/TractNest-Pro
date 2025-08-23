import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { findUserByUsername, createUser, updateLastLogin } from './repository.js';

const credsSchema = z.object({ 
  username: z.string().min(3), 
  email: z.string().email(),
  password: z.string().min(6) 
});

const loginSchema = z.object({ 
  username: z.string().min(3), 
  password: z.string().min(6) 
});

export async function register(payload) {
  const { username, email, password } = credsSchema.parse(payload);
  
  // Check if username exists in any organization
  const existing = await findUserByUsername(username);
  if (existing) {
    const err = new Error('Username already in use'); 
    err.status = 409; 
    throw err;
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  // For now, create user in the demo organization (ID: 1)
  // In a real multi-tenant app, you'd determine the organization from the request context
  return createUser({ username, email, passwordHash, organizationId: 1 });
}

export async function login(payload) {
  const { username, password } = loginSchema.parse(payload);
  
  const user = await findUserByUsername(username);
  if (!user) { 
    const err = new Error('Invalid credentials'); 
    err.status = 401; 
    throw err; 
  }
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) { 
    const err = new Error('Invalid credentials'); 
    err.status = 401; 
    throw err; 
  }
  
  // Update last login
  await updateLastLogin(user.id);
  
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ 
    sub: user.id, 
    username: user.username, 
    email: user.email,
    role: user.role,
    organizationId: user.organization_id 
  }, secret, { expiresIn: '7d' });
  
  return { 
    token, 
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role, 
      organizationId: user.organization_id 
    } 
  };
}

export async function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.verify(token, secret);
}


