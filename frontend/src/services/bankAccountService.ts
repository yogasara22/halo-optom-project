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

export interface CreateBankAccountDto {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    branch?: string;
    is_active?: boolean;
}

export interface UpdateBankAccountDto {
    bank_name?: string;
    account_number?: string;
    account_holder_name?: string;
    branch?: string;
    is_active?: boolean;
}

class BankAccountService {
    /**
     * Get all bank accounts (admin only)
     */
    async getBankAccounts(isActive?: boolean): Promise<BankAccount[]> {
        const query = isActive !== undefined ? `?is_active=${isActive}` : '';
        const response = await api.get(`/bank-accounts${query}`);
        return response.data.data;
    }

    /**
     * Get active bank accounts (public)
     */
    async getActiveBankAccounts(): Promise<BankAccount[]> {
        const response = await api.get('/bank-accounts/active');
        return response.data.data;
    }

    /**
     * Get bank account by ID
     */
    async getBankAccountById(id: string): Promise<BankAccount> {
        const response = await api.get(`/bank-accounts/${id}`);
        return response.data.data;
    }

    /**
     * Create new bank account
     */
    async createBankAccount(data: CreateBankAccountDto): Promise<BankAccount> {
        const response = await api.post('/bank-accounts', data);
        return response.data.data;
    }

    /**
     * Update bank account
     */
    async updateBankAccount(id: string, data: UpdateBankAccountDto): Promise<BankAccount> {
        const response = await api.patch(`/bank-accounts/${id}`, data);
        return response.data.data;
    }

    /**
     * Delete bank account
     */
    async deleteBankAccount(id: string): Promise<void> {
        await api.delete(`/bank-accounts/${id}`);
    }

    /**
     * Toggle bank account status
     */
    async toggleBankAccountStatus(id: string, isActive: boolean): Promise<BankAccount> {
        const response = await api.patch(`/bank-accounts/${id}/toggle`, { is_active: isActive });
        return response.data.data;
    }
}

export default new BankAccountService();
