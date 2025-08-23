import { Router } from 'express';
import { authenticateToken, requireOrganization } from '../../middlewares/auth.js';
import {
  listReceiptsController,
  getReceiptByIdController,
  createReceiptController,
  updateReceiptController,
  deleteReceiptController
} from './controller.js';

export const receiptsRoutes = Router();

// Apply authentication and organization middleware to all routes
receiptsRoutes.use(authenticateToken);
receiptsRoutes.use(requireOrganization);

// Receipt routes
receiptsRoutes.get('/', listReceiptsController);
receiptsRoutes.get('/:id', getReceiptByIdController);
receiptsRoutes.post('/', createReceiptController);
receiptsRoutes.put('/:id', updateReceiptController);
receiptsRoutes.delete('/:id', deleteReceiptController);


