import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export type NotificationType = 'appointment' | 'payment' | 'promo' | 'general';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'json', nullable: true })
  meta?: any;

  @Column({ default: false })
  is_read!: boolean;

  @Column({ type: 'varchar', nullable: true })
  type?: NotificationType;

  @CreateDateColumn()
  created_at!: Date;
}
