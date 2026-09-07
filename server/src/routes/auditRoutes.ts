import { Router } from 'express';
import { getAudits, createAudit, deleteAudit, getStats } from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/history', getAudits);
router.post('/history', createAudit);
router.delete('/history/:id', deleteAudit);
router.get('/stats', getStats);

export default router;
