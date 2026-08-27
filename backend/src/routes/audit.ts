import { Router } from 'express';
import { getAuditLogs } from '../controllers/AuditController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Only authenticated admins can view audit logs
router.get('/', authenticate, getAuditLogs);

export default router;
