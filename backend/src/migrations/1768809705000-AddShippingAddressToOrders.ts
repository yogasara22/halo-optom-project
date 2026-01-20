import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddShippingAddressToOrders1768809705000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("orders");
        const hasColumn = table?.columns.find(column => column.name === "shipping_address");

        if (!hasColumn) {
            await queryRunner.addColumn("orders", new TableColumn({
                name: "shipping_address",
                type: "json",
                isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("orders", "shipping_address");
    }

}
