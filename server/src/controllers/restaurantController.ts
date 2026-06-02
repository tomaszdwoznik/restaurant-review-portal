import type { Request, Response, NextFunction } from 'express';
import { createRestaurantSchema } from '../validators/restaurant';
import { listQuerySchema } from '../validators/restaurantQuery';
import * as service from '../services/restaurantService';

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const query = listQuerySchema.parse(req.query);
        res.json({ restaurants: await service.listRestaurants(query, req.user?.id) });
    } catch (e) { next(e); }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
    try {
        res.json({ restaurant: await service.getRestaurant(req.params.id, req.user?.id) });
    } catch (e) { next(e); }
}

export async function favorite(req: Request, res: Response, next: NextFunction) {
    try {
        await service.setFavorite(req.user!.id, req.params.id, true);
        res.json({ ok: true });
    } catch (e) { next(e); }
}

export async function unfavorite(req: Request, res: Response, next: NextFunction) {
    try {
        await service.setFavorite(req.user!.id, req.params.id, false);
        res.json({ ok: true });
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

export async function favorites(req: Request, res: Response, next: NextFunction) {
    try {
        res.json({ restaurants: await service.listFavorites(req.user!.id) });
    } catch (e) { next(e); }
}