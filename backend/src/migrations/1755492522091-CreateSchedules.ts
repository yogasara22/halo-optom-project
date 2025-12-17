import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateSchedules1755492522091 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "schedules",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "optometrist_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "day_of_week",
            type: "enum",
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
          {
            name: "start_time",
            type: "time",
            isNullable: false,
          },
          {
            name: "end_time",
            type: "time",
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

    await queryRunner.createForeignKey(
      "schedules",
      new TableForeignKey({
        columnNames: ["optometrist_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("schedules");
  }
}
