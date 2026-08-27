import { Router } from 'express';
import {
    getContentByType,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
} from '../controllers/contentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/:type', getContentByType); // /api/content/notice, /api/content/faq, /api/content/video
router.get('/item/:id', getContentById);

// Protected routes (admin only)
router.post('/', authenticate, createContent);
router.put('/:id', authenticate, updateContent);
router.delete('/:id', authenticate, deleteContent);

export default router;
