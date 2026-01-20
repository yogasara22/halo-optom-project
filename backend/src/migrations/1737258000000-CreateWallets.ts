import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWallets1737258000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'wallets',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                    },
                    {
                        name: 'role',
                        type: 'enum',
                        enum: ['optometris'],
                        default: "'optometris'",
                    },
                    {
                        name: 'balance',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'hold_balance',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['user_id'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        columnNames: ['user_id'],
                        isUnique: true,
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('wallets');
    }
}
