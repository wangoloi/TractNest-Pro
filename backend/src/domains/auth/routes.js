import { Router } from 'express';
import { 
  loginController, 
  registerController, 
  registerCustomerController, 
  logoutController,
  forgotPasswordController,
  verifyOtpController,
  resetPasswordController
} from './controller.js';

export const authRoutes = Router();

authRoutes.post('/login', loginController);
authRoutes.post('/register', registerController);
authRoutes.post('/register/customer', registerCustomerController);
authRoutes.post('/logout', logoutController);
authRoutes.post('/forgot-password', forgotPasswordController);
authRoutes.post('/verify-otp', verifyOtpController);
authRoutes.post('/reset-password', resetPasswordController);


