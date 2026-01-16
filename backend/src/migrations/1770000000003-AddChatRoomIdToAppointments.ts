import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddChatRoomIdToAppointments1770000000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("appointments", new TableColumn({
            name: "chat_room_id",
            type: "varchar",
            isNullable: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("appointments", "chat_room_id");
    }
}
