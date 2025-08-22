import { Router } from 'express';
import { loginController, registerController, registerCustomerController, logoutController } from './controller.js';

export const authRoutes = Router();

authRoutes.post('/login', loginController);
authRoutes.post('/register', registerController);
authRoutes.post('/register/customer', registerCustomerController);
authRoutes.post('/logout', logoutController);


