import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAppointments1755445442160 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // buat enum type
    await queryRunner.query(`CREATE TYPE "appointment_type_enum" AS ENUM ('online', 'homecare')`);
    await queryRunner.query(`CREATE TYPE "appointment_method_enum" AS ENUM ('chat', 'video')`);
    await queryRunner.query(`CREATE TYPE "appointment_status_enum" AS ENUM ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "payment_status_enum" AS ENUM ('unpaid', 'paid')`);

    await queryRunner.createTable(
      new Table({
        name: "appointments",
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
            name: "type",
            type: "appointment_type_enum",
            default: "'online'",
          },
          {
            name: "method",
            type: "appointment_method_enum",
            isNullable: true,
          },
          {
            name: "date",
            type: "date",
            isNullable: false,
          },
          {
            name: "start_time",
            type: "time",
            isNullable: false,
          },
          {
            name: "end_time",
            type: "time",
            isNullable: true,
          },
          {
            name: "location",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "appointment_status_enum",
            default: "'pending'",
          },
          {
            name: "payment_status",
            type: "payment_status_enum",
            default: "'unpaid'",
          },
          {
            name: "duration_minutes",
            type: "int",
            isNullable: true,
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "cancel_reason",
            type: "text",
            isNullable: true,
          },
          {
            name: "video_room_id",
            type: "varchar",
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

    // foreign keys
    await queryRunner.createForeignKey(
      "appointments",
      new TableForeignKey({
        columnNames: ["patient_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "appointments",
      new TableForeignKey({
        columnNames: ["optometrist_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("appointments");
    await queryRunner.query(`DROP TYPE "appointment_type_enum"`);
    await queryRunner.query(`DROP TYPE "appointment_method_enum"`);
    await queryRunner.query(`DROP TYPE "appointment_status_enum"`);
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
  }
}
