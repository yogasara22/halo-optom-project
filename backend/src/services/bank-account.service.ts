import { AppDataSource } from '../config/ormconfig';
import { BankAccount } from '../entities/BankAccount';

const bankAccountRepo = AppDataSource.getRepository(BankAccount);

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

/**
 * Create a new bank account
 */
export const createBankAccount = async (data: CreateBankAccountDto): Promise<BankAccount> => {
    const bankAccount = bankAccountRepo.create(data);
    return await bankAccountRepo.save(bankAccount);
};

/**
 * Get all bank accounts (with optional filter by active status)
 */
export const getBankAccounts = async (isActive?: boolean): Promise<BankAccount[]> => {
    if (isActive !== undefined) {
        return await bankAccountRepo.find({ where: { is_active: isActive } });
    }
    return await bankAccountRepo.find();
};

/**
 * Get active bank accounts only
 */
export const getActiveBankAccounts = async (): Promise<BankAccount[]> => {
    return await bankAccountRepo.find({ where: { is_active: true } });
};

/**
 * Get bank account by ID
 */
export const getBankAccountById = async (id: string): Promise<BankAccount | null> => {
    return await bankAccountRepo.findOne({ where: { id } });
};

/**
 * Update bank account
 */
export const updateBankAccount = async (
    id: string,
    data: UpdateBankAccountDto
): Promise<BankAccount> => {
    const bankAccount = await getBankAccountById(id);
    if (!bankAccount) {
        throw new Error('Bank account not found');
    }

    Object.assign(bankAccount, data);
    return await bankAccountRepo.save(bankAccount);
};

/**
 * Delete bank account
 */
export const deleteBankAccount = async (id: string): Promise<void> => {
    const bankAccount = await getBankAccountById(id);
    if (!bankAccount) {
        throw new Error('Bank account not found');
    }

    await bankAccountRepo.remove(bankAccount);
};

/**
 * Toggle bank account active status
 */
export const toggleBankAccountStatus = async (
    id: string,
    isActive: boolean
): Promise<BankAccount> => {
    return await updateBankAccount(id, { is_active: isActive });
};
