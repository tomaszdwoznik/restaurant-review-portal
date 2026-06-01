import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        res.status(400).json({ error: 'Błąd walidacji', issues: err.issues });
        return;
    }
    
    console.error(err);
    const status = err.status ?? 500;
    res.status(status).json({ error: err.message ?? 'Internal Server Error' });
};