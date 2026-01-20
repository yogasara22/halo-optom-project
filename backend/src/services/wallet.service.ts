import { AppDataSource } from '../config/ormconfig';
import { Wallet } from '../entities/Wallet';
import { User } from '../entities/User';

export class WalletService {
    private walletRepo = AppDataSource.getRepository(Wallet);

    /**
     * Get or create wallet for optometrist
     */
    async getOrCreateWallet(userId: string): Promise<Wallet> {
        let wallet = await this.walletRepo.findOne({
            where: { user: { id: userId } },
        });

        if (!wallet) {
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new Error('User not found');
            }

            wallet = this.walletRepo.create({
                user,
                role: 'optometris',
                balance: 0,
                hold_balance: 0,
            });

            await this.walletRepo.save(wallet);
        }

        return wallet;
    }

    /**
     * Add commission to wallet balance (called when appointment is completed)
     */
    async addCommission(userId: string, amount: number): Promise<Wallet> {
        const wallet = await this.getOrCreateWallet(userId);

        wallet.balance = Number(wallet.balance) + amount;

        return await this.walletRepo.save(wallet);
    }

    /**
     * Hold balance for withdrawal request
     */
    async holdBalance(userId: string, amount: number): Promise<Wallet> {
        const wallet = await this.getOrCreateWallet(userId);

        const availableBalance = Number(wallet.balance);

        if (availableBalance < amount) {
            throw new Error('Insufficient balance');
        }

        wallet.balance = availableBalance - amount;
        wallet.hold_balance = Number(wallet.hold_balance) + amount;

        return await this.walletRepo.save(wallet);
    }

    /**
     * Release held balance back to available balance (on rejection)
     */
    async releaseHold(userId: string, amount: number): Promise<Wallet> {
        const wallet = await this.getOrCreateWallet(userId);

        wallet.balance = Number(wallet.balance) + amount;
        wallet.hold_balance = Number(wallet.hold_balance) - amount;

        return await this.walletRepo.save(wallet);
    }

    /**
     * Deduct from hold balance (on paid)
     */
    async deductHold(userId: string, amount: number): Promise<Wallet> {
        const wallet = await this.getOrCreateWallet(userId);

        wallet.hold_balance = Number(wallet.hold_balance) - amount;

        return await this.walletRepo.save(wallet);
    }

    /**
     * Get wallet balance
     */
    async getBalance(userId: string): Promise<{ balance: number; hold_balance: number }> {
        const wallet = await this.getOrCreateWallet(userId);

        return {
            balance: Number(wallet.balance),
            hold_balance: Number(wallet.hold_balance),
        };
    }
}

export const walletService = new WalletService();
