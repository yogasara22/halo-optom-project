import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCommissionToUsers1770000000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "chat_commission_percentage",
            type: "float",
            isNullable: true,
            default: 0
        }));

        await queryRunner.addColumn("users", new TableColumn({
            name: "video_commission_percentage",
            type: "float",
            isNullable: true,
            default: 0
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "video_commission_percentage");
        await queryRunner.dropColumn("users", "chat_commission_percentage");
    }

}
