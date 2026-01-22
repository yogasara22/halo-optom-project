import { Request, Response } from 'express';
import * as bankAccountService from '../services/bank-account.service';

/**
 * Create a new bank account (Admin only)
 */
export const createBankAccount = async (req: Request, res: Response) => {
    try {
        const { bank_name, account_number, account_holder_name, branch, is_active } = req.body;

        if (!bank_name || !account_number || !account_holder_name) {
            return res.status(400).json({
                message: 'Bank name, account number, and account holder name are required',
            });
        }

        const bankAccount = await bankAccountService.createBankAccount({
            bank_name,
            account_number,
            account_holder_name,
            branch,
            is_active: is_active !== undefined ? is_active : true,
        });

        return res.status(201).json({
            message: 'Bank account created successfully',
            data: bankAccount,
        });
    } catch (error: any) {
        console.error('Error creating bank account:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

/**
 * Get all bank accounts (Admin only)
 */
export const getBankAccounts = async (req: Request, res: Response) => {
    try {
        const { is_active } = req.query;

        let isActiveFilter: boolean | undefined;
        if (is_active === 'true') {
            isActiveFilter = true;
        } else if (is_active === 'false') {
            isActiveFilter = false;
        }

        const bankAccounts = await bankAccountService.getBankAccounts(isActiveFilter);

        return res.json({
            message: 'Bank accounts retrieved successfully',
            data: bankAccounts,
        });
    } catch (error: any) {
        console.error('Error getting bank accounts:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

/**
 * Get active bank accounts (Public)
 */
export const getActiveBankAccounts = async (req: Request, res: Response) => {
    try {
        const bankAccounts = await bankAccountService.getActiveBankAccounts();

        return res.json({
            message: 'Active bank accounts retrieved successfully',
            data: bankAccounts,
        });
    } catch (error: any) {
        console.error('Error getting active bank accounts:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

/**
 * Get bank account by ID (Admin only)
 */
export const getBankAccountById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bankAccount = await bankAccountService.getBankAccountById(id);

        if (!bankAccount) {
            return res.status(404).json({ message: 'Bank account not found' });
        }

        return res.json({
            message: 'Bank account retrieved successfully',
            data: bankAccount,
        });
    } catch (error: any) {
        console.error('Error getting bank account:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

/**
 * Update bank account (Admin only)
 */
export const updateBankAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { bank_name, account_number, account_holder_name, branch, is_active } = req.body;

        const bankAccount = await bankAccountService.updateBankAccount(id, {
            bank_name,
            account_number,
            account_holder_name,
            branch,
            is_active,
        });

        return res.json({
            message: 'Bank account updated successfully',
            data: bankAccount,
        });
    } catch (error: any) {
        console.error('Error updating bank account:', error);
        if (error.message === 'Bank account not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

/**
 * Delete bank account (Admin only)
 */
export const deleteBankAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await bankAccountService.deleteBankAccount(id);

        return res.json({
            message: 'Bank account deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting bank account:', error);
        if (error.message === 'Bank account not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

/**
 * Toggle bank account status (Admin only)
 */
export const toggleBankAccountStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) {
            return res.status(400).json({ message: 'is_active field is required' });
        }

        const bankAccount = await bankAccountService.toggleBankAccountStatus(id, is_active);

        return res.json({
            message: 'Bank account status updated successfully',
            data: bankAccount,
        });
    } catch (error: any) {
        console.error('Error toggling bank account status:', error);
        if (error.message === 'Bank account not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
