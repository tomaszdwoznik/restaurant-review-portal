import type { Request, Response, NextFunction } from 'express';
import { createRestaurantSchema } from '../validators/restaurant';
import * as service from '../services/restaurantService';

export async function list(_req: Request, res: Response, next: NextFunction) {
    try {
        res.json({ restaurants: await service.listRestaurants() });
    } catch (e) { next(e); }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        res.json({ restaurant: await service.getRestaurant(id) });
    } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = createRestaurantSchema.parse(req.body);
        const restaurant = await service.createRestaurant(req.user!.id, data);
        res.status(201).json({ restaurant });
    } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        await service.deleteRestaurant(id, req.user!.id);
        res.status(204).end();
    } catch (e) { next(e); }
}