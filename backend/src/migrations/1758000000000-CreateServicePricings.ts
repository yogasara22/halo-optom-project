import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateServicePricings1758000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "service_type_enum" AS ENUM ('online', 'homecare')`);
    await queryRunner.query(`CREATE TYPE "service_method_enum" AS ENUM ('chat', 'video')`);

    await queryRunner.createTable(
      new Table({
        name: "service_pricings",
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
            type: "service_type_enum",
            isNullable: false,
          },
          {
            name: "method",
            type: "service_method_enum",
            isNullable: false,
          },
          {
            name: "base_price",
            type: "decimal",
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            onUpdate: "now()",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("service_pricings");
    await queryRunner.query(`DROP TYPE "service_method_enum"`);
    await queryRunner.query(`DROP TYPE "service_type_enum"`);
  }
}
