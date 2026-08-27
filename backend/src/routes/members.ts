import { Router } from 'express';
import {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
} from '../controllers/memberController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getMembers);
router.get('/:id', getMemberById);

// Protected routes (Admin only)
router.post('/', authenticate, requirePermission('members'), createMember);
router.put('/:id', authenticate, requirePermission('members'), updateMember);
router.delete('/:id', authenticate, requirePermission('members'), deleteMember);

export default router;
