import { AppDataSource } from '../config/ormconfig';
import { WithdrawRequest, WithdrawStatus } from '../entities/WithdrawRequest';
import { User, UserRole } from '../entities/User';
import { walletService } from './wallet.service';
import { notificationService } from './notification.service';

const MINIMUM_WITHDRAWAL = 50000; // Rp 50,000

export class WithdrawService {
    private withdrawRepo = AppDataSource.getRepository(WithdrawRequest);

    /**
     * Create new withdrawal request
     */
    async createWithdrawRequest(
        optometristId: string,
        data: {
            amount: number;
            bank_name: string;
            bank_account_number: string;
            bank_account_name: string;
        }
    ): Promise<WithdrawRequest> {
        // Validate amount
        if (data.amount < MINIMUM_WITHDRAWAL) {
            throw new Error(`Minimum withdrawal amount is Rp ${MINIMUM_WITHDRAWAL.toLocaleString('id-ID')}`);
        }

        if (data.amount <= 0) {
            throw new Error('Invalid withdrawal amount');
        }

        // Check balance and hold it
        try {
            await walletService.holdBalance(optometristId, data.amount);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to hold balance');
        }

        // Create withdrawal request
        const userRepo = AppDataSource.getRepository(User);
        const optometrist = await userRepo.findOne({ where: { id: optometristId } });

        if (!optometrist) {
            // Rollback hold
            await walletService.releaseHold(optometristId, data.amount);
            throw new Error('Optometrist not found');
        }

        const withdrawRequest = this.withdrawRepo.create({
            optometrist,
            amount: data.amount,
            bank_name: data.bank_name,
            bank_account_number: data.bank_account_number,
            bank_account_name: data.bank_account_name,
            status: 'PENDING',
        });

        const savedParams = await this.withdrawRepo.save(withdrawRequest);

        // Notify Admins
        const adminRepo = AppDataSource.getRepository(User);
        const admins = await adminRepo.find({ where: { role: UserRole.Admin } });

        for (const admin of admins) {
            await notificationService.createNotification(
                admin.id,
                'Permintaan Penarikan Baru',
                `${optometrist?.name} mengajukan penarikan sebesar Rp ${data.amount.toLocaleString('id-ID')}`,
                'payment', // Using 'payment' or 'general' as type
                { type: 'withdrawal', id: savedParams.id }
            );
        }

        return savedParams;
    }

    /**
     * Get withdrawal requests with optional filters
     */
    async getWithdrawRequests(filters?: {
        optometristId?: string;
        status?: WithdrawStatus;
    }): Promise<WithdrawRequest[]> {
        const query = this.withdrawRepo.createQueryBuilder('wr')
            .leftJoinAndSelect('wr.optometrist', 'optometrist')
            .leftJoinAndSelect('wr.reviewed_by_admin', 'admin')
            .orderBy('wr.requested_at', 'DESC');

        if (filters?.optometristId) {
            query.andWhere('wr.optometrist_id = :optometristId', { optometristId: filters.optometristId });
        }

        if (filters?.status) {
            query.andWhere('wr.status = :status', { status: filters.status });
        }

        return await query.getMany();
    }

    /**
     * Get withdrawal request by ID
     */
    async getWithdrawRequestById(id: string): Promise<WithdrawRequest | null> {
        return await this.withdrawRepo.findOne({
            where: { id },
            relations: ['optometrist', 'reviewed_by_admin'],
        });
    }

    /**
     * Approve withdrawal request
     */
    async approveRequest(requestId: string, adminId: string): Promise<WithdrawRequest> {
        const request = await this.getWithdrawRequestById(requestId);

        if (!request) {
            throw new Error('Withdrawal request not found');
        }

        if (request.status !== 'PENDING') {
            throw new Error('Only pending requests can be approved');
        }

        const adminRepo = AppDataSource.getRepository(User);
        const admin = await adminRepo.findOne({ where: { id: adminId, role: UserRole.Admin } });

        if (!admin) {
            throw new Error('Admin not found');
        }

        request.status = 'APPROVED';
        request.reviewed_by_admin_id = adminId;
        request.reviewed_at = new Date();

        const savedRequest = await this.withdrawRepo.save(request);

        // Notify Optometrist
        await notificationService.createNotification(
            request.optometrist.id,
            'Penarikan Disetujui',
            `Permintaan penarikan Rp ${Number(request.amount).toLocaleString('id-ID')} telah disetujui. Dana akan segera dikirim.`,
            'payment',
            { type: 'withdrawal', id: request.id, status: 'APPROVED' }
        );

        return savedRequest;
    }

    /**
     * Reject withdrawal request and refund balance
     */
    async rejectRequest(requestId: string, adminId: string, reason: string): Promise<WithdrawRequest> {
        const request = await this.getWithdrawRequestById(requestId);

        if (!request) {
            throw new Error('Withdrawal request not found');
        }

        if (request.status !== 'PENDING') {
            throw new Error('Only pending requests can be rejected');
        }

        const adminRepo = AppDataSource.getRepository(User);
        const admin = await adminRepo.findOne({ where: { id: adminId, role: UserRole.Admin } });

        if (!admin) {
            throw new Error('Admin not found');
        }

        // Release hold and refund balance
        await walletService.releaseHold(request.optometrist.id, Number(request.amount));

        request.status = 'REJECTED';
        request.reviewed_by_admin_id = adminId;
        request.reviewed_at = new Date();
        request.note = reason;

        const savedRequest = await this.withdrawRepo.save(request);

        // Notify Optometrist
        await notificationService.createNotification(
            request.optometrist.id,
            'Penarikan Ditolak',
            `Permintaan penarikan Rp ${Number(request.amount).toLocaleString('id-ID')} ditolak. Alasan: ${reason}. Saldo telah dikembalikan.`,
            'payment',
            { type: 'withdrawal', id: request.id, status: 'REJECTED' }
        );

        return savedRequest;
    }

    /**
     * Mark withdrawal request as paid
     */
    async markAsPaid(requestId: string, adminId: string): Promise<WithdrawRequest> {
        const request = await this.getWithdrawRequestById(requestId);

        if (!request) {
            throw new Error('Withdrawal request not found');
        }

        if (request.status !== 'APPROVED') {
            throw new Error('Only approved requests can be marked as paid');
        }

        // Deduct from hold balance
        await walletService.deductHold(request.optometrist.id, Number(request.amount));

        request.status = 'PAID';

        const savedRequest = await this.withdrawRepo.save(request);

        // Notify Optometrist
        await notificationService.createNotification(
            request.optometrist.id,
            'Penarikan Berhasil',
            `Dana sebesar Rp ${Number(request.amount).toLocaleString('id-ID')} telah berhasil ditransfer ke rekening Anda.`,
            'payment',
            { type: 'withdrawal', id: request.id, status: 'PAID' }
        );

        return savedRequest;
    }
}

export const withdrawService = new WithdrawService();
