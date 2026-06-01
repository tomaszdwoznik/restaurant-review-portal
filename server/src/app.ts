import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/authRoutes';

export function createApp() {
    const app = express();

    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json());
    app.use(cookieParser());

    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api/auth', authRouter);

    app.use(errorHandler);
    return app;
}