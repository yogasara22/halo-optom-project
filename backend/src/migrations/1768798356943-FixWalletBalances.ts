import { MigrationInterface, QueryRunner } from "typeorm";

export class FixWalletBalances1768798356943 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Recalculate balances for all optometrists from completed paid appointments
        await queryRunner.query(`
            UPDATE wallets w
            SET balance = (
                SELECT COALESCE(SUM(a.commission_amount), 0)
                FROM appointments a
                WHERE a.optometrist_id = w.user_id 
                AND a.status = 'completed' 
                AND a.payment_status = 'paid'
                AND a.commission_amount IS NOT NULL
            ) - w.hold_balance
            WHERE w.role = 'optometris'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
