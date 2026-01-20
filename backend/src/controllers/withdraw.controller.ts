import { Request, Response } from 'express';
import { withdrawService } from '../services/withdraw.service';
import { User } from '../entities/User';

export const createWithdrawRequest = async (req: Request, res: Response) => {
    try {
        const customReq = req as any;
        const user = customReq.user as User;

        if (!user || user.role !== 'optometris') {
            return res.status(403).json({ message: 'Only optometrists can create withdrawal requests' });
        }

        const { amount, bank_name, bank_account_number, bank_account_name } = req.body;

        if (!amount || !bank_name || !bank_account_number || !bank_account_name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const withdrawRequest = await withdrawService.createWithdrawRequest(user.id, {
            amount: Number(amount),
            bank_name,
            bank_account_number,
            bank_account_name,
        });

        return res.status(201).json({
            message: 'Withdrawal request created successfully',
            data: withdrawRequest,
        });
    } catch (error: any) {
        console.error('Error creating withdrawal request:', error);
        return res.status(400).json({ message: error.message || 'Failed to create withdrawal request' });
    }
};

export const getMyWithdrawRequests = async (req: Request, res: Response) => {
    try {
        const customReq = req as any;
        const user = customReq.user as User;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const status = req.query.status as any;

        const requests = await withdrawService.getWithdrawRequests({
            optometristId: user.id,
            status,
        });

        return res.json({
            data: requests,
        });
    } catch (error: any) {
        console.error('Error fetching withdrawal requests:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

export const getWithdrawRequests = async (req: Request, res: Response) => {
    try {
        const customReq = req as any;
        const user = customReq.user as User;

        // Admin can see all requests, optometrist sees only their own
        if (user.role === 'optometris') {
            return getMyWithdrawRequests(req, res);
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const status = req.query.status as any;

        const requests = await withdrawService.getWithdrawRequests({ status });

        return res.json({
            data: requests,
        });
    } catch (error: any) {
        console.error('Error fetching withdrawal requests:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

export const approveWithdrawRequest = async (req: Request, res: Response) => {
    try {
        const customReq = req as any;
        const user = customReq.user as User;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can approve withdrawal requests' });
        }

        const { id } = req.params;

        const request = await withdrawService.approveRequest(id, user.id);

        return res.json({
            message: 'Withdrawal request approved successfully',
            data: request,
        });
    } catch (error: any) {
        console.error('Error approving withdrawal request:', error);
        return res.status(400).json({ message: error.message || 'Failed to approve withdrawal request' });
    }
};

export const rejectWithdrawRequest = async (req: Request, res: Response) => {
    try {
        const customReq = req as any;
        const user = customReq.user as User;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can reject withdrawal requests' });
        }

        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const request = await withdrawService.rejectRequest(id, user.id, reason);

        return res.json({
            message: 'Withdrawal request rejected successfully',
            data: request,
        });
    } catch (error: any) {
        console.error('Error rejecting withdrawal request:', error);
        return res.status(400).json({ message: error.message || 'Failed to reject withdrawal request' });
    }
};

export const markWithdrawAsPaid = async (req: Request, res: Response) => {
    try {
        const customReq = req as any;
        const user = customReq.user as User;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can mark withdrawal as paid' });
        }

        const { id } = req.params;

        const request = await withdrawService.markAsPaid(id, user.id);

        return res.json({
            message: 'Withdrawal marked as paid successfully',
            data: request,
        });
    } catch (error: any) {
        console.error('Error marking withdrawal as paid:', error);
        return res.status(400).json({ message: error.message || 'Failed to mark withdrawal as paid' });
    }
};
