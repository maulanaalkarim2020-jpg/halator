import { Router } from 'express';
import { getAffiliateData, requestPayout } from '../controllers/affiliateController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAffiliateData);
router.post('/payout', requestPayout);

export default router;
