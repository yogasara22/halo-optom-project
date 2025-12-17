import express from 'express';
import { create, getById, update, xenditWebhook, getAll, getStats, exportReport } from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Routes yang memerlukan autentikasi
router.post('/', authenticateToken, create);
router.get('/stats', authenticateToken, getStats);
router.get('/export', authenticateToken, exportReport);
router.get('/:id', authenticateToken, getById);
router.put('/:id', authenticateToken, update);
router.get('/', authenticateToken, getAll);

// Webhook routes (tidak memerlukan autentikasi)
router.post('/webhook/xendit', xenditWebhook);

export default router;