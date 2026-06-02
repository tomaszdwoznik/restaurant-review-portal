import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(8, 'Hasło musi mieć min. 8 znaków'),
    displayName: z.string().min(1, 'Podaj nazwę'),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
    email: z.email(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, 'Hasło musi mieć min. 8 znaków'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;