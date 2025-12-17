import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMedicalRecord1755492229419 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "medical_records",
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
            name: "optometrist_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "appointment_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "diagnosis",
            type: "text",
            isNullable: true,
          },
          {
            name: "prescription",
            type: "text",
            isNullable: true,
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "attachments",
            type: "text",
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
            onUpdate: "now()",
          },
        ],
      }),
      true
    );

    // FK patient_id → users.id
    await queryRunner.createForeignKey(
      "medical_records",
      new TableForeignKey({
        columnNames: ["patient_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    // FK optometrist_id → users.id
    await queryRunner.createForeignKey(
      "medical_records",
      new TableForeignKey({
        columnNames: ["optometrist_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    // FK appointment_id → appointments.id
    await queryRunner.createForeignKey(
      "medical_records",
      new TableForeignKey({
        columnNames: ["appointment_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "appointments",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("medical_records");
  }
}