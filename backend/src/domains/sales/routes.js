import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import * as controller from './controller.js';

export const salesRoutes = Router();

// Apply authentication to all sales routes
salesRoutes.use(authenticateToken);

salesRoutes.get('/', controller.list);
salesRoutes.get('/inventory', controller.getInventory);
salesRoutes.post('/', controller.create);
salesRoutes.delete('/:id', controller.remove);

