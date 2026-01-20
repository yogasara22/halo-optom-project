import api from '../lib/api';

export interface WalletBalance {
    balance: number;
    hold_balance: number;
    formatted_balance: string;
    formatted_hold_balance: string;
}

export type WithdrawStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface WithdrawRequest {
    id: string;
    optometrist: {
        id: string;
        name: string;
        email: string;
    };
    amount: number;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    status: WithdrawStatus;
    requested_at: string;
    reviewed_by_admin_id?: string;
    reviewed_at?: string;
    note?: string;
    updated_at: string;
}

export interface CreateWithdrawRequestData {
    amount: number;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
}

class WalletService {
    async getBalance(): Promise<WalletBalance> {
        try {
            const response = await api.get('/wallet/balance');
            return response.data;
        } catch (error) {
            console.error('Get wallet balance error:', error);
            throw error;
        }
    }

    async getWithdrawHistory(): Promise<WithdrawRequest[]> {
        try {
            const response = await api.get('/withdraw-requests');
            return response.data.data;
        } catch (error) {
            console.error('Get withdraw history error:', error);
            throw error;
        }
    }

    async createWithdrawRequest(data: CreateWithdrawRequestData): Promise<WithdrawRequest> {
        try {
            const response = await api.post('/withdraw-requests', data);
            return response.data.data;
        } catch (error: any) {
            console.error('Create withdraw request error:', error);
            // Extract error message from response
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    }
}

export const walletService = new WalletService();
export default walletService;
