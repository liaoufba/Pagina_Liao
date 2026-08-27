import { Router } from 'express';
import { createArticle, getArticles, updateArticle, deleteArticle, toggleLikeArticle } from '../controllers/ArticleController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getArticles);
router.post('/:id/like', toggleLikeArticle);

// Protected routes (Admin only)
router.post('/', authenticate, requirePermission('newsletter'), createArticle);
router.put('/:id', authenticate, requirePermission('newsletter'), updateArticle);
router.delete('/:id', authenticate, requirePermission('newsletter'), deleteArticle);

export default router;
