import { Router } from 'express';
import { prisma } from '../config/prisma';

export const menuTypeRouter = Router();

menuTypeRouter.get('/', async (_req, res, next) => {
    try {
        res.json({ menuTypes: await prisma.menuType.findMany({ orderBy: { name: 'asc' } }) });
    } catch (e) { next(e); }
});