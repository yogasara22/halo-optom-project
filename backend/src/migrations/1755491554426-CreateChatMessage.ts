import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateChatMessage1755491554426 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "chat_messages",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "room_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "from_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "to_user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "message",
            type: "text",
            isNullable: false,
          },
          {
            name: "attachments",
            type: "json",
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

    // FK room_id → chat_rooms.id
    await queryRunner.createForeignKey(
      "chat_messages",
      new TableForeignKey({
        columnNames: ["room_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "chat_rooms",
        onDelete: "CASCADE",
      })
    );

    // FK from_user_id → users.id
    await queryRunner.createForeignKey(
      "chat_messages",
      new TableForeignKey({
        columnNames: ["from_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    // FK to_user_id → users.id
    await queryRunner.createForeignKey(
      "chat_messages",
      new TableForeignKey({
        columnNames: ["to_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("chat_messages");
  }
}