import api from '../lib/api';

export interface BankAccount {
    id: string;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    branch?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Get active bank accounts for payment
 */
export const getActiveBankAccounts = async (): Promise<BankAccount[]> => {
    try {
        const response = await api.get('/bank-accounts/active');
        return response.data.data;
    } catch (error: any) {
        console.error('Error fetching active bank accounts:', error);
        throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
};

export default {
    getActiveBankAccounts,
};
