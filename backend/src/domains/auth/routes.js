import { Router } from 'express';
import { loginController, registerController, logoutController } from './controller.js';

export const authRoutes = Router();

authRoutes.post('/login', loginController);
authRoutes.post('/register', registerController);
authRoutes.post('/logout', logoutController);


