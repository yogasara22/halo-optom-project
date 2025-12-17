import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrders1755493831834 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // buat enum status order
    await queryRunner.query(
      `CREATE TYPE "order_status_enum" AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled')`
    );

    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "patient_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "total",
            type: "decimal",
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: "status",
            type: "order_status_enum",
            default: "'pending'",
          },
          {
            name: "payment_data",
            type: "json",
            isNullable: true,
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
          },
        ],
      }),
      true
    );

    // FK ke users
    await queryRunner.createForeignKey(
      "orders",
      new TableForeignKey({
        columnNames: ["patient_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("orders");
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
  }
}
