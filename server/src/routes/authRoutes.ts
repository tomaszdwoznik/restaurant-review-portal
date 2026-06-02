import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { requireAuth } from '../middleware/requireAuth';
import { forgotPassword } from '../controllers/authController';
import { resetPasswordHandler } from '../controllers/authController';
export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPasswordHandler);
authRouter.get('/me', requireAuth, me);