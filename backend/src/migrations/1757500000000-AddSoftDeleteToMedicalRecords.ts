import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToMedicalRecords1757500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add is_deleted column with default false
    await queryRunner.query(`
      ALTER TABLE "medical_records" 
      ADD COLUMN "is_deleted" boolean NOT NULL DEFAULT false
    `);

    // Add deleted_at column
    await queryRunner.query(`
      ALTER TABLE "medical_records" 
      ADD COLUMN "deleted_at" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns in reverse order
    await queryRunner.query(`
      ALTER TABLE "medical_records" 
      DROP COLUMN "deleted_at",
      DROP COLUMN "is_deleted"
    `);
  }
}