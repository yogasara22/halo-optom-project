// src/routes/order.routes.ts
import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Semua endpoint order butuh autentikasi user
 * createOrder → untuk buat order baru
 * getOrders → untuk ambil list order (user / admin)
 * updateOrderStatus → untuk admin mengubah status manual
 */

// Buat order baru
router.post('/', authMiddleware, createOrder);

// Ambil semua order milik user (atau semua order kalau admin)
router.get('/', authMiddleware, getOrders);

// Update status order (hanya admin)
router.patch('/:id/status', authMiddleware, updateOrderStatus);

export default router;
