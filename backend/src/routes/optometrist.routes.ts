import { Router } from 'express';
import { getOptometrists, getOptometristById, getFeaturedOptometrists, getAvailableSchedules } from '../controllers/optometrist.controller';

const router = Router();

router.get('/', getOptometrists);
router.get('/featured', getFeaturedOptometrists);
router.get('/:id', getOptometristById);
router.get('/:id/schedules', getAvailableSchedules);

export default router;
