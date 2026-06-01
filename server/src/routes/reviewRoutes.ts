import { Router } from 'express';
import * as reviewCtrl from '../controllers/reviewController';
import { requireAuth } from '../middleware/requireAuth';

export const reviewRouter = Router();

reviewRouter.get('/search', requireAuth, reviewCtrl.search);