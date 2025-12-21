import { Router } from 'express';
import { getDashboardStats } from '../controllers/analytics.controller';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.get(
    '/stats',
    authMiddleware,
    authorize([UserRole.Admin]),
    getDashboardStats
);

export default router;
