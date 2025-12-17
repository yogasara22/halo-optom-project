import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { getAllUsers, deleteUser, getDashboardStats } from '../controllers/admin.controller';

const router = Router();

// Semua route admin wajib pakai authMiddleware + adminMiddleware
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.get('/stats', authMiddleware, adminMiddleware, getDashboardStats);

export default router;
