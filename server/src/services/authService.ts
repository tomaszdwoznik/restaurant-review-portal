import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import type { RegisterInput, LoginInput } from '../validators/auth';
import crypto from 'node:crypto';

export async function registerUser(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        const err: any = new Error('Użytkownik z tym adresem e-mail już istnieje');
        err.status = 409;
        throw err;
    }

    const passwordHash = await hashPassword(input.password);
    return prisma.user.create({
        data: { email: input.email, passwordHash, displayName: input.displayName },
        select: { id: true, email: true, displayName: true, createdAt: true },
    });
}

export async function loginUser(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !(await verifyPassword(user.passwordHash, input.password))) {
        const err: any = new Error('Nieprawidłowy e-mail lub hasło');
        err.status = 401;
        throw err;
    }

    return { id: user.id, email: user.email, displayName: user.displayName };
}

export async function requestPasswordReset(email: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.create({
        data: {
            tokenHash,
            userId: user.id,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
    });

    return rawToken;
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
        const err: any = new Error('Token nieprawidłowy lub wygasł');
        err.status = 400;
        throw err;
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
        prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
        prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
}