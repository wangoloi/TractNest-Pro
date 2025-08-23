import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { findUserByUsername, createUser, updateLastLogin, findUserByEmail } from './repository.js';
import { sendWelcomeEmail, sendOtpEmail } from '../../infrastructure/email/emailService.js';

// In-memory OTP storage (not persisted to database)
const otpStore = new Map();

const credsSchema = z.object({ 
  username: z.string().min(3), 
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager', 'user', 'customer']).optional().default('user'),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional()
});

const customerRegSchema = z.object({ 
  username: z.string().min(3), 
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional()
});

const loginSchema = z.object({ 
  username: z.string().min(3), 
  password: z.string().min(6) 
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6)
});

export async function register(payload) {
  const { username, email, password, role = 'user', first_name, last_name } = credsSchema.parse(payload);
  
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
  const user = await createUser({ 
    username, 
    email, 
    passwordHash, 
    organizationId: 1,
    role,
    first_name: first_name || username,
    last_name: last_name || ''
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(email, username, password);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error, user creation should still succeed
  }

  return user;
}

export async function registerCustomer(payload) {
  const { username, email, password, first_name, last_name, phone, address } = customerRegSchema.parse(payload);
  
  // Check if username exists in any organization
  const existing = await findUserByUsername(username);
  if (existing) {
    const err = new Error('Username already in use'); 
    err.status = 409; 
    throw err;
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create customer user with 'customer' role
  const user = await createUser({ 
    username, 
    email, 
    passwordHash, 
    organizationId: 1,
    role: 'customer',
    first_name,
    last_name
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(email, username, password);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error, user creation should still succeed
  }

  return user;
}

export async function login(payload) {
  const { username, password } = loginSchema.parse(payload);
  
  const user = await findUserByUsername(username);
  if (!user) { 
    const err = new Error('Invalid credentials'); 
    err.status = 401; 
    throw err; 
  }
  
  const ok = await bcrypt.compare(password, user.password_hash);
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
      organizationId: user.organization_id,
      first_name: user.first_name,
      last_name: user.last_name
    } 
  };
}

export async function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.verify(token, secret);
}

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function forgotPassword(payload) {
  const { email } = forgotPasswordSchema.parse(payload);
  
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Email not found');
    err.status = 404;
    throw err;
  }
  
  // Generate OTP
  const otp = generateOTP();
  
  // Store OTP in memory with expiration (10 minutes)
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
  });
  
  // Send OTP via email
  try {
    await sendOtpEmail(email, otp, user.username);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    // Still log OTP for development
    console.log(`📧 OTP for ${email}: ${otp}`);
  }
  
  return { message: 'OTP sent to your email' };
}

export async function verifyOtp(payload) {
  const { email, otp } = verifyOtpSchema.parse(payload);
  
  const storedData = otpStore.get(email);
  if (!storedData) {
    const err = new Error('OTP expired or not found');
    err.status = 400;
    throw err;
  }
  
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    const err = new Error('OTP expired');
    err.status = 400;
    throw err;
  }
  
  if (storedData.otp !== otp) {
    const err = new Error('Invalid OTP');
    err.status = 400;
    throw err;
  }
  
  return { message: 'OTP verified successfully' };
}

export async function resetPassword(payload) {
  const { email, otp, newPassword } = resetPasswordSchema.parse(payload);
  
  const storedData = otpStore.get(email);
  if (!storedData) {
    const err = new Error('OTP expired or not found');
    err.status = 400;
    throw err;
  }
  
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    const err = new Error('OTP expired');
    err.status = 400;
    throw err;
  }
  
  if (storedData.otp !== otp) {
    const err = new Error('Invalid OTP');
    err.status = 400;
    throw err;
  }
  
  // Find user and update password
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  // Update password in database
  await updatePassword(user.id, passwordHash);
  
  // Remove OTP from store
  otpStore.delete(email);
  
  return { message: 'Password reset successfully' };
}


