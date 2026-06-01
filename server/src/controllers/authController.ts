import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/auth';
import { registerUser, loginUser } from '../services/authService';
import { signToken } from '../utils/jwt';

const COOKIE = 'token';
const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
};

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);
        const user = await registerUser(data);
        res.cookie(COOKIE, signToken({ userId: user.id }), cookieOptions);
        res.status(201).json({ user });
    } catch (e) {
        next(e);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const data = loginSchema.parse(req.body);
        const user = await loginUser(data);
        res.cookie(COOKIE, signToken({ userId: user.id }), cookieOptions);
        res.json({ user });
    } catch (e) {
        next(e);
    }
}

export function logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE);
    res.json({ ok: true });
}

export function me(req: Request, res: Response) {
    res.json({ user: req.user });
}