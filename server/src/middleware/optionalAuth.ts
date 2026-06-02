import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/prisma';

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (token) {
        try {
            const { userId } = verifyToken(token);
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, displayName: true },
            });
            if (user) req.user = user;
        } catch {
        }
    }
    next();
}