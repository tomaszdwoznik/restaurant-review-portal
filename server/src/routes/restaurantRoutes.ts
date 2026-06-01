import { Router } from 'express';
import * as ctrl from '../controllers/restaurantController';
import { requireAuth } from '../middleware/requireAuth';

export const restaurantRouter = Router();

restaurantRouter.get('/', ctrl.list);
restaurantRouter.get('/:id', ctrl.detail);
restaurantRouter.post('/', requireAuth, ctrl.create);
restaurantRouter.delete('/:id', requireAuth, ctrl.remove);  