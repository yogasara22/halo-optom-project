import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.schedules, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'optometrist_id' })
  optometrist!: User;

  @Column({ type: 'enum', enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] })
  day_of_week!: DayOfWeek;

  @Column({ type: 'time' })
  start_time!: string; // '09:00:00'

  @Column({ type: 'time' })
  end_time!: string;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
