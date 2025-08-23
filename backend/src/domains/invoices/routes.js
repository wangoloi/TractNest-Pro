import { Router } from 'express';
import { authenticateToken, requireOrganization } from '../../middlewares/auth.js';
import {
  listInvoicesController,
  getInvoiceByIdController,
  createInvoiceController,
  updateInvoiceController,
  deleteInvoiceController,
  updatePaymentStatusController,
  getInvoiceStatsController,
  getRecentInvoicesController
} from './controller.js';

export const invoicesRoutes = Router();

// Apply authentication and organization middleware to all routes
invoicesRoutes.use(authenticateToken);
invoicesRoutes.use(requireOrganization);

// Invoice routes
invoicesRoutes.get('/', listInvoicesController);
invoicesRoutes.get('/stats', getInvoiceStatsController);
invoicesRoutes.get('/recent', getRecentInvoicesController);
invoicesRoutes.get('/:id', getInvoiceByIdController);
invoicesRoutes.post('/', createInvoiceController);
invoicesRoutes.put('/:id', updateInvoiceController);
invoicesRoutes.patch('/:id/payment-status', updatePaymentStatusController);
invoicesRoutes.delete('/:id', deleteInvoiceController);


