import { Router } from 'express';
import * as ctrl from '../controllers/restaurantController';
import { requireAuth } from '../middleware/requireAuth';
import * as reviewCtrl from '../controllers/reviewController';
import { optionalAuth } from '../middleware/optionalAuth';
export const restaurantRouter = Router();

restaurantRouter.get('/', optionalAuth, ctrl.list);
restaurantRouter.post('/', requireAuth, ctrl.create);
restaurantRouter.get('/favorites', requireAuth, ctrl.favorites);
restaurantRouter.get('/:id', optionalAuth, ctrl.detail);
restaurantRouter.delete('/:id', requireAuth, ctrl.remove);
restaurantRouter.post('/:id/favorite', requireAuth, ctrl.favorite);
restaurantRouter.delete('/:id/favorite', requireAuth, ctrl.unfavorite);
restaurantRouter.post('/:id/reviews', requireAuth, reviewCtrl.add);
restaurantRouter.delete('/:id/reviews', requireAuth, reviewCtrl.remove); 