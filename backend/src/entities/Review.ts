import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient!: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'optometrist_id' })
  optometrist!: User;

  @Column({ type: 'int', default: 5 })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status!: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'int', default: 0 })
  report_count!: number;

  @Column({ type: 'text', nullable: true })
  service_type?: string;

  @CreateDateColumn()
  created_at!: Date;
}
