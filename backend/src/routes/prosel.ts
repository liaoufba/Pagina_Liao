import { Router } from 'express';
import {
    getProSelInfo,
    submitApplication,
    getAllApplications,
    updateApplicationStatus,
} from '../controllers/proselController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProSelInfo);
router.post('/apply', submitApplication);

// Protected routes (admin only)
router.get('/applications', authenticate, getAllApplications);
router.put('/applications/:id', authenticate, updateApplicationStatus);

export default router;
