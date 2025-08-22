import { Router } from 'express';
import { authenticateToken, requireOrganization } from '../../middlewares/auth.js';
import * as controller from './receipts.controller.js';

export const receiptsRoutes = Router();

// Apply authentication and organization middleware to all routes
receiptsRoutes.use(authenticateToken);
receiptsRoutes.use(requireOrganization);

receiptsRoutes.get('/', controller.list);
receiptsRoutes.post('/', controller.create);


