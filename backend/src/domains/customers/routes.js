import express from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/roleCheck.js';
import {
  list,
  create,
  getById,
  update,
  remove,
  search
} from './controller.js';

export const customerRoutes = express.Router();

// All customer routes require authentication and admin role
customerRoutes.use(authenticateToken);
customerRoutes.use(requireAdmin);

// Customer management routes
customerRoutes.get('/', list);
customerRoutes.post('/', create);
customerRoutes.get('/search', search);
customerRoutes.get('/:id', getById);
customerRoutes.put('/:id', update);
customerRoutes.delete('/:id', remove);
