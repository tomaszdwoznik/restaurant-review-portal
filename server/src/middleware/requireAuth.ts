import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/prisma';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: 'Wymagane logowanie' });
        return;
    }
    
    try {
        const { userId } = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, displayName: true },
        });
        
        if (!user) {
            res.status(401).json({ error: 'Wymagane logowanie' });
            return;
        }
        
        req.user = user;
        next();
    } catch {
        res.status(401).json({ error: 'Nieprawidłowy lub wygasły token' });
    }
}