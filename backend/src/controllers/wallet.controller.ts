import { Request, Response } from 'express';
import { walletService } from '../services/wallet.service';

export const getWalletBalance = async (req: Request, res: Response) => {
    try {
        const customReq = req as any;
        const userId = customReq.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const balance = await walletService.getBalance(userId);

        return res.json({
            balance: balance.balance,
            hold_balance: balance.hold_balance,
            formatted_balance: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(balance.balance),
            formatted_hold_balance: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(balance.hold_balance),
        });
    } catch (error: any) {
        console.error('Error fetching wallet balance:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
