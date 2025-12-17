import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAdditionalImagesToProducts1757600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "additional_images",
        type: "text",
        isNullable: true,
        isArray: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "additional_images");
  }
}