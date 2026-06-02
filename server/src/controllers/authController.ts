import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth';
import { registerUser, loginUser, requestPasswordReset, resetPassword } from '../services/authService';
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

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);
        const token = await requestPasswordReset(email);
        res.json({
            message: 'Jeśli konto istnieje, wygenerowano link do resetu hasła.',
            ...(token && process.env.NODE_ENV !== 'production' ? { devToken: token } : {}),
        });
    } catch (e) { next(e); }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);
        await resetPassword(token, password);
        res.json({ message: 'Hasło zostało zmienione. Możesz się zalogować.' });
    } catch (e) { next(e); }
}