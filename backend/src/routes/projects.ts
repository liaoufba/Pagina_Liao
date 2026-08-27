import { Router } from 'express';
import { createProject, getProjects, updateProject, deleteProject } from '../controllers/ProjectController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProjects);

// Protected routes (Admin only)
router.post('/', authenticate, requirePermission('projects'), createProject);
router.put('/:id', authenticate, requirePermission('projects'), updateProject);
router.delete('/:id', authenticate, requirePermission('projects'), deleteProject);

export default router;
