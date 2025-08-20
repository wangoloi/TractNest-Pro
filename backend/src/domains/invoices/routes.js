import { Router } from 'express';
import * as controller from './invoices.controller.js';

export const invoicesRoutes = Router();

invoicesRoutes.get('/', controller.list);
invoicesRoutes.post('/', controller.create);


