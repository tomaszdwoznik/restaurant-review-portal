import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/authRoutes';
import { restaurantRouter } from './routes/restaurantRoutes';
import { menuTypeRouter } from './routes/menuTypeRoutes';

export function createApp() {
    const app = express();

    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json());
    app.use(cookieParser());

    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api/auth', authRouter);
    app.use('/api/restaurants', restaurantRouter);
    app.use('/api/menu-types', menuTypeRouter);

    app.use(errorHandler);
    return app;
}