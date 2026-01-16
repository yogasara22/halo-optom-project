import { Router } from 'express';
import { getDashboardStats, getRevenueAnalytics } from '../controllers/analytics.controller';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.get(
    '/stats',
    authMiddleware,
    authorize([UserRole.Admin]),
    getDashboardStats
);

router.get(
    '/revenue',
    authMiddleware,
    authorize([UserRole.Admin]),
    getRevenueAnalytics
);

export default router;
