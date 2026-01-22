import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class UpdatePaymentTableForBankTransfer1737386500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns
        await queryRunner.addColumn(
            'payments',
            new TableColumn({
                name: 'payment_proof_url',
                type: 'varchar',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'payments',
            new TableColumn({
                name: 'payment_deadline',
                type: 'timestamp',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'payments',
            new TableColumn({
                name: 'verified_by_id',
                type: 'uuid',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'payments',
            new TableColumn({
                name: 'verified_at',
                type: 'timestamp',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'payments',
            new TableColumn({
                name: 'rejection_reason',
                type: 'text',
                isNullable: true,
            })
        );

        // Add foreign key for verified_by_id
        await queryRunner.createForeignKey(
            'payments',
            new TableForeignKey({
                columnNames: ['verified_by_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            })
        );

        // Update payment_method enum to include 'bank_transfer'
        await queryRunner.query(`
      ALTER TYPE "payments_payment_method_enum" 
      RENAME TO "payments_payment_method_enum_old"
    `);

        await queryRunner.query(`
      CREATE TYPE "payments_payment_method_enum" AS ENUM(
        'xendit', 'bank_transfer', 'manual', 'other'
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "payments" 
      ALTER COLUMN "payment_method" TYPE "payments_payment_method_enum" 
      USING "payment_method"::text::"payments_payment_method_enum"
    `);

        await queryRunner.query(`
      DROP TYPE "payments_payment_method_enum_old"
    `);

        // Update status enum to include new statuses
        await queryRunner.query(`
      ALTER TYPE "payments_status_enum" 
      RENAME TO "payments_status_enum_old"
    `);

        await queryRunner.query(`
      CREATE TYPE "payments_status_enum" AS ENUM(
        'pending', 'paid', 'failed', 'expired', 'cancelled', 
        'waiting_verification', 'verified', 'rejected'
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "payments" 
      ALTER COLUMN "status" TYPE "payments_status_enum" 
      USING "status"::text::"payments_status_enum"
    `);

        await queryRunner.query(`
      DROP TYPE "payments_status_enum_old"
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key
        const table = await queryRunner.getTable('payments');
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('verified_by_id') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('payments', foreignKey);
        }

        // Remove columns
        await queryRunner.dropColumn('payments', 'rejection_reason');
        await queryRunner.dropColumn('payments', 'verified_at');
        await queryRunner.dropColumn('payments', 'verified_by_id');
        await queryRunner.dropColumn('payments', 'payment_deadline');
        await queryRunner.dropColumn('payments', 'payment_proof_url');

        // Revert payment_method enum
        await queryRunner.query(`
      ALTER TYPE "payments_payment_method_enum" 
      RENAME TO "payments_payment_method_enum_new"
    `);

        await queryRunner.query(`
      CREATE TYPE "payments_payment_method_enum" AS ENUM(
        'xendit', 'manual', 'other'
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "payments" 
      ALTER COLUMN "payment_method" TYPE "payments_payment_method_enum" 
      USING "payment_method"::text::"payments_payment_method_enum"
    `);

        await queryRunner.query(`
      DROP TYPE "payments_payment_method_enum_new"
    `);

        // Revert status enum
        await queryRunner.query(`
      ALTER TYPE "payments_status_enum" 
      RENAME TO "payments_status_enum_new"
    `);

        await queryRunner.query(`
      CREATE TYPE "payments_status_enum" AS ENUM(
        'pending', 'paid', 'failed', 'expired', 'cancelled'
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "payments" 
      ALTER COLUMN "status" TYPE "payments_status_enum" 
      USING "status"::text::"payments_status_enum"
    `);

        await queryRunner.query(`
      DROP TYPE "payments_status_enum_new"
    `);
    }
}
