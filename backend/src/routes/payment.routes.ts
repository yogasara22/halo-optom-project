import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';
import { uploadPaymentProof } from '../middlewares/upload.middleware';
import {
    create,
    getById,
    update,
    getAll,
    getStats,
    exportReport,
    uploadPaymentProofFile,
    uploadProof,
    verify,
    reject,
    getPending,
    xenditWebhook
} from '../controllers/payment.controller';

const router = Router();

// Bank transfer file upload
router.post('/:id/proof-file', authMiddleware, uploadPaymentProof.single('proof_image'), uploadPaymentProofFile);

// Bank transfer payment routes (old text-based)
router.post('/:id/proof', authMiddleware, uploadProof); // Upload payment proof URL
router.get('/pending', authMiddleware, adminMiddleware, getPending); // Get pending payments (admin only)
router.patch('/:id/verify', authMiddleware, adminMiddleware, verify); // Verify payment (admin only)
router.patch('/:id/reject', authMiddleware, adminMiddleware, reject); // Reject payment (admin only)

// Routes yang memerlukan autentikasi
router.post('/', authMiddleware, create);
router.get('/stats', authMiddleware, getStats);
router.get('/export', authMiddleware, exportReport);
router.get('/:id', authMiddleware, getById);
router.put('/:id', authMiddleware, update);
router.get('/', authMiddleware, getAll);

// Webhook routes (tidak memerlukan autentikasi)
router.post('/xendit/callback', xenditWebhook);

export default router;