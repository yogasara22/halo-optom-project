import { Router } from 'express';
import {
    createReview,
    getReviewsForOptometrist,
    getMyReviews,
    deleteReview,
    getAllReviewsAdmin,
    getReviewStatsAdmin,
    updateReviewStatus
} from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Pasien membuat / update review untuk optometris
router.post('/', authMiddleware, createReview);

// Mendapatkan semua review untuk optometris tertentu
router.get('/optometrist/:optometrist_id', getReviewsForOptometrist);

// Pasien melihat semua review yang dia buat
router.get('/me', authMiddleware, getMyReviews);

// Pasien menghapus review yang dia buat
router.delete('/:id', authMiddleware, deleteReview);

// ADMIN: Get all reviews
router.get('/admin/all', authMiddleware, getAllReviewsAdmin);

// ADMIN: Get review stats
router.get('/admin/stats', authMiddleware, getReviewStatsAdmin);

// ADMIN: Update review status
router.patch('/:id/status', authMiddleware, updateReviewStatus);

export default router;
