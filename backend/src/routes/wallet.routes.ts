import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getWalletBalance } from '../controllers/wallet.controller';

const router = Router();

// Get wallet balance (optometrist only)
router.get('/balance', authMiddleware, getWalletBalance);

export default router;
