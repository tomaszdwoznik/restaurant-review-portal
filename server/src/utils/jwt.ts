import 'dotenv/config';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    throw new Error('Brak JWT_SECRET w .env');
}

export interface TokenPayload {
    userId: string;
}

export const signToken = (payload: TokenPayload): string =>
    jwt.sign(payload, SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string): TokenPayload =>
    jwt.verify(token, SECRET) as unknown as TokenPayload;