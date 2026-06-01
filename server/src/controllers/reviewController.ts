import type { Request, Response, NextFunction } from 'express';
import { createReviewSchema } from '../validators/review';
import * as service from '../services/reviewService';

export async function add(req: Request, res: Response, next: NextFunction) {
    try {
        const data = createReviewSchema.parse(req.body);
        const restaurantId = req.params.id as string;
        const review = await service.addReview(req.user!.id, restaurantId, data);
        res.status(201).json({ review });
    } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const restaurantId = req.params.id as string;
        await service.deleteReview(req.user!.id, restaurantId);
        res.status(204).end();
    } catch (e) { next(e); }
}

export async function search(req: Request, res: Response, next: NextFunction) {
    try {
        const q = String(req.query.q ?? '').trim();
        if (!q) {
            res.json({ reviews: [] });
            return;
        }
        res.json({ reviews: await service.searchReviews(q) });
    } catch (e) { next(e); }
}