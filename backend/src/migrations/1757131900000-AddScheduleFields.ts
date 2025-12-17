import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScheduleFields1757131900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new fields to schedules table
    await queryRunner.query(`
      ALTER TABLE "schedules" 
      ADD COLUMN "description" text,
      ADD COLUMN "location" varchar(255),
      ADD COLUMN "notes" text,
      ADD COLUMN "date" date,
      ADD COLUMN "max_patients" integer DEFAULT 10,
      ADD COLUMN "current_patients" integer DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added fields
    await queryRunner.query(`
      ALTER TABLE "schedules" 
      DROP COLUMN "description",
      DROP COLUMN "location",
      DROP COLUMN "notes",
      DROP COLUMN "date",
      DROP COLUMN "max_patients",
      DROP COLUMN "current_patients"
    `);
  }
}