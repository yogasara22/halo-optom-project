import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Order } from './Order';
import { Appointment } from './Appointment';
import { User } from './User';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'waiting_verification' | 'verified' | 'rejected';
export type PaymentMethod = 'xendit' | 'bank_transfer' | 'manual' | 'other';
export type PaymentType = 'order' | 'appointment';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ['order', 'appointment'] })
  payment_type!: PaymentType;

  @Column({ type: 'uuid', nullable: true })
  order_id?: string;

  @Column({ type: 'uuid', nullable: true })
  appointment_id?: string;

  @OneToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @OneToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointment;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'failed', 'expired', 'cancelled', 'waiting_verification', 'verified', 'rejected'], default: 'pending' })
  status!: PaymentStatus;

  @Column({ type: 'enum', enum: ['xendit', 'bank_transfer', 'manual', 'other'], default: 'xendit' })
  payment_method!: PaymentMethod;

  @Column({ type: 'varchar', nullable: true })
  payment_id?: string; // ID dari penyedia pembayaran (Xendit)

  @Column({ type: 'varchar', nullable: true })
  external_id?: string; // ID eksternal untuk penyedia pembayaran

  @Column({ type: 'json', nullable: true })
  payment_details?: any; // Detail tambahan dari penyedia pembayaran

  @Column({ type: 'varchar', nullable: true })
  payment_proof_url?: string; // URL bukti pembayaran untuk bank transfer

  @Column({ type: 'timestamp', nullable: true })
  payment_deadline?: Date; // Deadline pembayaran (24 jam dari created_at)

  @Column({ type: 'uuid', nullable: true })
  verified_by_id?: string; // ID admin yang memverifikasi

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by_id' })
  verified_by?: User; // Admin yang memverifikasi

  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date; // Waktu verifikasi

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string; // Alasan penolakan jika ditolak

  @Column({ type: 'timestamp', nullable: true })
  paid_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}