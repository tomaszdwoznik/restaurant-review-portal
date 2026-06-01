import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { requireAuth } from '../middleware/requireAuth';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);