import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import type { RegisterInput, LoginInput } from '../validators/auth';

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