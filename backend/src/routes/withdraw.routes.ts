import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import {
    createWithdrawRequest,
    getWithdrawRequests,
    approveWithdrawRequest,
    rejectWithdrawRequest,
    markWithdrawAsPaid,
} from '../controllers/withdraw.controller';

const router = Router();

// Optometrist routes
router.post('/', authMiddleware, createWithdrawRequest);
router.get('/', authMiddleware, getWithdrawRequests);

// Admin routes
router.patch('/:id/approve', authMiddleware, adminMiddleware, approveWithdrawRequest);
router.patch('/:id/reject', authMiddleware, adminMiddleware, rejectWithdrawRequest);
router.patch('/:id/mark-paid', authMiddleware, adminMiddleware, markWithdrawAsPaid);

export default router;
