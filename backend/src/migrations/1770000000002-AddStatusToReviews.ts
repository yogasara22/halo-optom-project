import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusToReviews1770000000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('reviews', new TableColumn({
            name: 'status',
            type: 'varchar', // using varchar for simple enum handling in migration if enum type is tricky, assuming app handles validation or we can use enum type. TypeORM postgres driver uses enum type usually.
            // But let's stick to varchar for simplicity and robustness in migration unless we strictly need DB-level enum
            default: "'pending'",
            isNullable: false,
        }));

        await queryRunner.addColumn('reviews', new TableColumn({
            name: 'report_count',
            type: 'int',
            default: 0,
            isNullable: false,
        }));

        await queryRunner.addColumn('reviews', new TableColumn({
            name: 'service_type',
            type: 'varchar',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('reviews', 'service_type');
        await queryRunner.dropColumn('reviews', 'report_count');
        await queryRunner.dropColumn('reviews', 'status');
    }
}
