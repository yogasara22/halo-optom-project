import { Router } from 'express';
import { createReview, getReviewsForOptometrist, getMyReviews, deleteReview } from '../controllers/review.controller';
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

export default router;
