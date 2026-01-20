import { MigrationInterface, QueryRunner } from "typeorm";

export class ResyncWalletBalances1768798356999 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Force recalculate balances for all optometrists
        // This takes the sum of all paid commissions and subtracts any currently held amount
        // If a wallet doesn't exist, it should likely be created, but for strict SQL update we target existing wallets.
        await queryRunner.query(`
            UPDATE wallets w
            SET balance = (
                SELECT COALESCE(SUM(a.commission_amount), 0)
                FROM appointments a
                WHERE a.optometrist_id = w.user_id 
                AND a.payment_status = 'paid'
                AND a.commission_amount IS NOT NULL
            ) - w.hold_balance
            WHERE w.role = 'optometris'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration logic needed for a sync
    }

}
