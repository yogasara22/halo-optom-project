import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { MedicalRecord } from './MedicalRecord';
import { Payment } from './Payment';

export type AppointmentType = 'online' | 'homecare';
export type AppointmentMethod = 'chat' | 'video';
export type AppointmentStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, u => u.appointments_as_patient, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient!: User;

  @ManyToOne(() => User, u => u.appointments_as_optometrist, { eager: true })
  @JoinColumn({ name: 'optometrist_id' })
  optometrist!: User;

  @Column({ type: 'enum', enum: ['online', 'homecare'], default: 'online' })
  type!: AppointmentType;

  @Column({ type: 'enum', enum: ['chat', 'video'], nullable: true })
  method?: AppointmentMethod;

  @Column({ type: 'date' })
  date!: string; // YYYY-MM-DD

  @Column({ type: 'time' })
  start_time!: string;

  @Column({ type: 'time', nullable: true })
  end_time?: string;

  @Column({ type: 'text', nullable: true })
  location?: string; // for homecare

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'], default: 'pending' })
  status!: AppointmentStatus;

  @Column({ type: 'enum', enum: ['unpaid', 'paid'], default: 'unpaid' })
  payment_status!: PaymentStatus;

  @Column({ type: 'float', nullable: true })
  commission_percentage?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  commission_amount?: number;

  @Column({ type: 'timestamp', nullable: true })
  commission_calculated_at?: Date;

  @Column({ type: 'int', nullable: true })
  duration_minutes?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'text', nullable: true })
  cancel_reason?: string;

  @Column({ type: 'varchar', nullable: true })
  video_room_id?: string; // VideoSDK room ID

  @Column({ type: 'varchar', nullable: true })
  chat_room_id?: string; // Chat room ID for chat consultations

  @OneToOne(() => MedicalRecord, mr => mr.appointment, { cascade: true })
  medical_record?: MedicalRecord;

  @OneToOne(() => Payment, payment => payment.appointment, { nullable: true })
  payment?: Payment;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
