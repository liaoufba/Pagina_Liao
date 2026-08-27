import { Router } from 'express';
import { getAllPartners, createPartner, deletePartner, updatePartner } from '../controllers/PartnerController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

console.log('[DEBUG] Loading partners routes module');

router.get('/', (req, res, next) => {
    console.log('[DEBUG] Hit /api/partners GET');
    next();
}, getAllPartners);
router.post('/', authenticate, requirePermission('partners'), createPartner);
router.put('/:id', authenticate, requirePermission('partners'), updatePartner);
router.delete('/:id', authenticate, requirePermission('partners'), deletePartner);

export default router;
