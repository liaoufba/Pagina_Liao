import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, requireAdmin } from '../middleware/auth';
import { uploadImage } from '../controllers/UploadController';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

const handleMulter = (req: Request, res: Response, next: NextFunction): void => {
    upload.single('file')(req, res, (error) => {
        if (!error) {
            next();
            return;
        }
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ success: false, error: 'Arquivo maior que 10 MB.' });
            return;
        }
        res.status(400).json({ success: false, error: error.message || 'Falha ao ler o arquivo.' });
    });
};

const router = Router();
router.post('/', authenticate, requireAdmin, handleMulter, uploadImage);

export default router;
