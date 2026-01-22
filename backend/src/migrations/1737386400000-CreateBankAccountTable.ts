import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBankAccountTable1737386400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'bank_accounts',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'bank_name',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'account_number',
                        type: 'varchar',
                        length: '50',
                    },
                    {
                        name: 'account_holder_name',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'branch',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('bank_accounts');
    }
}
