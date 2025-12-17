import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePaymentTable1757500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'payment_type',
            type: 'enum',
            enum: ['order', 'appointment'],
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'appointment_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'paid', 'failed', 'expired', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['xendit', 'manual', 'other'],
            default: "'xendit'",
          },
          {
            name: 'payment_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'external_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_details',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'paid_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    // Foreign key untuk order_id
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'SET NULL',
      })
    );

    // Foreign key untuk appointment_id
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['appointment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'appointments',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign keys terlebih dahulu
    const table = await queryRunner.getTable('payments');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('payments', foreignKey);
      }
    }
    
    // Hapus tabel
    await queryRunner.dropTable('payments');
  }
}