import { Router } from 'express';
import { login, register, getCurrentUser, getAdmins, deleteUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/register', authenticate, register); // Only authenticated admins can create new admins
router.get('/me', authenticate, getCurrentUser);
router.get('/admins', authenticate, getAdmins);
router.delete('/users/:id', authenticate, deleteUser);

export default router;
