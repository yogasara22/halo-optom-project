import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { listPricing, createPricing, updatePricing, deletePricing, lookupPricing } from '../controllers/servicePricing.controller';

const router = Router();

router.get('/pricing', listPricing);
router.get('/pricing/lookup', lookupPricing);
router.post('/pricing', authMiddleware, adminMiddleware, createPricing);
router.put('/pricing/:id', authMiddleware, adminMiddleware, updatePricing);
router.delete('/pricing/:id', authMiddleware, adminMiddleware, deletePricing);

export default router;
