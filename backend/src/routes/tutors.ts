import { Router } from 'express';
import {
    getAllTutors,
    getTutorById,
    createTutor,
    updateTutor,
    deleteTutor,
} from '../controllers/tutorController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllTutors);
router.get('/:id', getTutorById);

// Protected routes (admin only)
router.post('/', authenticate, requirePermission('tutors'), createTutor);
router.put('/:id', authenticate, requirePermission('tutors'), updateTutor);
router.delete('/:id', authenticate, requirePermission('tutors'), deleteTutor);

export default router;
