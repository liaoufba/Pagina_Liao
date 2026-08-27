import { Router } from 'express';
import { getFAQsByEvent, createFAQ, updateFAQ, deleteFAQ } from '../controllers/FAQController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/event/:eventId', getFAQsByEvent);

// Admin routes
router.post('/', authenticate, requirePermission('events'), createFAQ);
router.put('/:id', authenticate, requirePermission('events'), updateFAQ);
router.delete('/:id', authenticate, requirePermission('events'), deleteFAQ);

export default router;
