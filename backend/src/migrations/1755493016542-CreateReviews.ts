import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateReviews1755493016542 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "reviews",
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
            name: "rating",
            type: "int",
            default: 5,
          },
          {
            name: "comment",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Foreign key ke users (patient)
    await queryRunner.createForeignKey(
      "reviews",
      new TableForeignKey({
        columnNames: ["patient_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    // Foreign key ke users (optometrist)
    await queryRunner.createForeignKey(
      "reviews",
      new TableForeignKey({
        columnNames: ["optometrist_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("reviews");
  }
}
