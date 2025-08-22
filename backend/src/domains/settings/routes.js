import express from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/roleCheck.js';
import {
  list,
  get,
  create,
  update,
  remove,
  bulkUpdate
} from './controller.js';

export const settingsRoutes = express.Router();

// All settings routes require authentication and admin role
settingsRoutes.use(authenticateToken);
settingsRoutes.use(requireAdmin);

settingsRoutes.get('/', list);
settingsRoutes.get('/:key', get);
settingsRoutes.post('/', create);
settingsRoutes.put('/:key', update);
settingsRoutes.delete('/:key', remove);
settingsRoutes.post('/bulk', bulkUpdate);
