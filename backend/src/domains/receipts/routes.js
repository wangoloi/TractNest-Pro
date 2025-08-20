import { Router } from 'express';
import * as controller from './receipts.controller.js';

export const receiptsRoutes = Router();

receiptsRoutes.get('/', controller.list);
receiptsRoutes.post('/', controller.create);


