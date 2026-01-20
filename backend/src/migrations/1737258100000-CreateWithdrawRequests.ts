import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWithdrawRequests1737258100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'withdraw_requests',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'optometrist_id',
                        type: 'uuid',
                    },
                    {
                        name: 'amount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                    },
                    {
                        name: 'bank_name',
                        type: 'varchar',
                    },
                    {
                        name: 'bank_account_number',
                        type: 'varchar',
                    },
                    {
                        name: 'bank_account_name',
                        type: 'varchar',
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
                        default: "'PENDING'",
                    },
                    {
                        name: 'requested_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'reviewed_by_admin_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'reviewed_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'note',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['optometrist_id'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                    {
                        columnNames: ['reviewed_by_admin_id'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    },
                ],
                indices: [
                    {
                        columnNames: ['optometrist_id'],
                    },
                    {
                        columnNames: ['status'],
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('withdraw_requests');
    }
}
