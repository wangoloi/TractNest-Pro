import { Router } from 'express';
import { listInventoryController } from './controller.js';

export const publicInventoryRoutes = Router();

// Public routes (no authentication required)
publicInventoryRoutes.get('/', listInventoryController);
