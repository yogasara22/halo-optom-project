import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateReports1773500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "reports",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "type",
                        type: "varchar",
                    },
                    {
                        name: "title",
                        type: "varchar",
                    },
                    {
                        name: "description",
                        type: "varchar",
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["pending", "processing", "completed", "failed"],
                        default: "'pending'",
                    },
                    {
                        name: "download_url",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "record_count",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "metadata",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "generated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("reports");
    }
}
