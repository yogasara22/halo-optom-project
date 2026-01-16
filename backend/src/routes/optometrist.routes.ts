import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getOptometrists, getOptometristById, getFeaturedOptometrists, getAvailableSchedules, getCommissionBalance } from '../controllers/optometrist.controller';

const router = Router();

router.get('/balance', authMiddleware, getCommissionBalance); // Must be before /:id to avoid conflict
router.get('/', getOptometrists);
router.get('/featured', getFeaturedOptometrists);
router.get('/:id', getOptometristById);
router.get('/:id/schedules', getAvailableSchedules);

export default router;
