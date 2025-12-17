import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateChatRoom1755445848228 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // chat_rooms
    await queryRunner.createTable(
      new Table({
        name: "chat_rooms",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "appointment_id",
            type: "uuid",
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

    // FK ke appointments (optional link)
    await queryRunner.createForeignKey(
      "chat_rooms",
      new TableForeignKey({
        columnNames: ["appointment_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "appointments",
        onDelete: "SET NULL",
      })
    );

    // chat_room_participants (join table)
    await queryRunner.createTable(
      new Table({
        name: "chat_room_participants",
        columns: [
          {
            name: "chat_room_id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "user_id",
            type: "uuid",
            isPrimary: true,
          },
        ],
      }),
      true
    );

    // FK chat_room_id → chat_rooms.id
    await queryRunner.createForeignKey(
      "chat_room_participants",
      new TableForeignKey({
        columnNames: ["chat_room_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "chat_rooms",
        onDelete: "CASCADE",
      })
    );

    // FK user_id → users.id
    await queryRunner.createForeignKey(
      "chat_room_participants",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("chat_room_participants");
    await queryRunner.dropTable("chat_rooms");
  }
}
