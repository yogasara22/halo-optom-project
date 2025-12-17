import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsers1755445106798 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "password_hash",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "role",
            type: "enum",
            enum: ["pasien", "optometris", "admin"],
            default: "'pasien'",
          },
          {
            name: "phone",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "avatar_url",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "bio",
            type: "text",
            isNullable: true,
          },
          {
            name: "experience",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "certifications",
            type: "text",
            isNullable: true,
          },
          {
            name: "rating",
            type: "float",
            isNullable: true,
          },
          {
            name: "date_of_birth",
            type: "date",
            isNullable: true,
          },
          {
            name: "gender",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "address",
            type: "text",
            isNullable: true,
          },
          {
            name: "is_verified",
            type: "boolean",
            default: false,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
