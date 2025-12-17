import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommissionFieldsToAppointments1764659600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointments" ADD COLUMN "commission_percentage" float`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD COLUMN "commission_amount" decimal(12,2)`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD COLUMN "commission_calculated_at" timestamp`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "commission_calculated_at"`);
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "commission_amount"`);
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "commission_percentage"`);
  }
}

