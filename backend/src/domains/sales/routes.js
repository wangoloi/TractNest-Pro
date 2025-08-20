import { Router } from 'express';
import * as controller from './sales.controller.js';

export const salesRoutes = Router();

salesRoutes.get('/', controller.list);
salesRoutes.post('/', controller.create);
salesRoutes.delete('/:id', controller.remove);



