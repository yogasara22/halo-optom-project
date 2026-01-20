import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateExistingCommissions1737258200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create wallets for all optometrists with their commission balance
        await queryRunner.query(`
      INSERT INTO wallets (user_id, role, balance, hold_balance, created_at, updated_at)
      SELECT 
        u.id as user_id,
        'optometris' as role,
        COALESCE(SUM(a.commission_amount), 0) as balance,
        0 as hold_balance,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
      FROM users u
      LEFT JOIN appointments a ON a.optometrist_id = u.id 
        AND a.status = 'completed' 
        AND a.payment_status = 'paid'
        AND a.commission_amount IS NOT NULL
      WHERE u.role = 'optometris'
      AND NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = u.id)
      GROUP BY u.id
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove all wallets created by this migration
        await queryRunner.query(`DELETE FROM wallets`);
    }
}
