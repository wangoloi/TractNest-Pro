import { Router } from 'express';
import { authenticateToken, requireOrganization } from '../../middlewares/auth.js';
import * as controller from './invoices.controller.js';

export const invoicesRoutes = Router();

// Apply authentication and organization middleware to all routes
invoicesRoutes.use(authenticateToken);
invoicesRoutes.use(requireOrganization);

invoicesRoutes.get('/', controller.listInvoicesController);
invoicesRoutes.post('/', controller.createInvoiceController);


