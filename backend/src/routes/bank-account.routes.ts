import { Router } from 'express';
import * as bankAccountController from '../controllers/bank-account.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Bank Account Management Routes
 * Admin endpoints require both authMiddleware and adminMiddleware
 * Public endpoint (getActiveBankAccounts) only requires authMiddleware
 */

// Get active bank accounts (for patients to see when making payment)
router.get('/active', authMiddleware, bankAccountController.getActiveBankAccounts);

// Admin routes - require admin role
router.post('/', authMiddleware, adminMiddleware, bankAccountController.createBankAccount);
router.get('/', authMiddleware, adminMiddleware, bankAccountController.getBankAccounts);
router.get('/:id', authMiddleware, adminMiddleware, bankAccountController.getBankAccountById);
router.patch('/:id', authMiddleware, adminMiddleware, bankAccountController.updateBankAccount);
router.delete('/:id', authMiddleware, adminMiddleware, bankAccountController.deleteBankAccount);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, bankAccountController.toggleBankAccountStatus);

export default router;
