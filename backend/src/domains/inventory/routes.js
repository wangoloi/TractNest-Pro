import { Router } from 'express';
import { authenticateToken, requireOrganization } from '../../middlewares/auth.js';
import {
  listInventoryController,
  getInventoryByIdController,
  createInventoryItemController,
  updateInventoryItemController,
  deleteInventoryItemController,
  getLowStockItemsController,
  updateStockQuantityController
} from './controller.js';

export const inventoryRoutes = Router();

// Apply authentication and organization middleware to all routes
inventoryRoutes.use(authenticateToken);
inventoryRoutes.use(requireOrganization);

// Inventory routes
inventoryRoutes.get('/', listInventoryController);
inventoryRoutes.get('/low-stock', getLowStockItemsController);
inventoryRoutes.get('/:id', getInventoryByIdController);
inventoryRoutes.post('/', createInventoryItemController);
inventoryRoutes.put('/:id', updateInventoryItemController);
inventoryRoutes.patch('/:id/quantity', updateStockQuantityController);
inventoryRoutes.delete('/:id', deleteInventoryItemController);



