import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('service_pricings')
export class ServicePricing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ['online','homecare'] })
  type!: 'online' | 'homecare';

  @Column({ type: 'enum', enum: ['chat','video'] })
  method!: 'chat' | 'video';

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  base_price!: number;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
