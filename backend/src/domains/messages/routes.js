import express from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/roleCheck.js';
import {
  list,
  create,
  getById,
  update,
  remove,
  stats
} from './controller.js';

export const messageRoutes = express.Router();

// Public route for customers to send messages
messageRoutes.post('/contact', create);

// Admin-only routes
messageRoutes.use(authenticateToken);
messageRoutes.use(requireAdmin);

messageRoutes.get('/', list);
messageRoutes.get('/stats', stats);
messageRoutes.get('/:id', getById);
messageRoutes.put('/:id', update);
messageRoutes.delete('/:id', remove);
