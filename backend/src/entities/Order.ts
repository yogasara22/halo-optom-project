import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { OrderItem } from './OrderItem';
import { Payment } from './Payment';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient!: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true, eager: true })
  items!: OrderItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total!: number;

  @Column({ type: 'enum', enum: ['pending','paid','shipped','delivered','cancelled'], default: 'pending' })
  status!: OrderStatus;

  @Column({ type: 'json', nullable: true })
  payment_data?: any;
  
  @OneToOne(() => Payment, payment => payment.order, { nullable: true })
  payment?: Payment;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
