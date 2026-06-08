import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/authRoutes';
import { restaurantRouter } from './routes/restaurantRoutes';
import { menuTypeRouter } from './routes/menuTypeRoutes';
import { reviewRouter } from './routes/reviewRoutes';
import { uploadRouter } from './routes/uploadRoutes';

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
    app.use('/api/reviews', reviewRouter);
    app.use('/uploads', express.static(path.resolve('uploads')));
    app.use('/api/upload', uploadRouter);

    const clientDist = process.env.CLIENT_DIST;
    if (clientDist) {
        app.use(express.static(clientDist));
        app.use((req, res, next) => {
            if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
                next();
                return;
            }
            res.sendFile(path.join(clientDist, 'index.html'));
        });
    }

    app.use(errorHandler);
    return app;
}