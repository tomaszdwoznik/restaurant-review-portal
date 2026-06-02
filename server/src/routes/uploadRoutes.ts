import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { requireAuth } from '../middleware/requireAuth';

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
        else cb(new Error('Dozwolone tylko obrazy (JPEG, PNG, WebP, GIF)'));
    },
});

export const uploadRouter = Router();

uploadRouter.post('/', requireAuth, upload.single('photo'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'Nie przesłano pliku' });
        return;
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
});