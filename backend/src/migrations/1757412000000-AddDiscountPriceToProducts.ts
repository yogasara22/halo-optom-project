import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDiscountPriceToProducts1757412000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "discount_price",
        type: "decimal",
        precision: 12,
        scale: 2,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "discount_price");
  }
}