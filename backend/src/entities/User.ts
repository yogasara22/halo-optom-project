import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from './Appointment';
import { Schedule } from './Schedule';
import { Order } from './Order';
import { Notification } from './Notification';
import { MedicalRecord } from './MedicalRecord';
import { ChatMessage } from './ChatMessage';
import { Review } from './Review';

export enum UserRole {
  Pasien = 'pasien',
  Optometris = 'optometris',
  Admin = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Pasien })
  role!: UserRole;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  experience?: string;

  @Column({ type: 'simple-array', nullable: true })
  certifications?: string[]; // Store as comma-separated string automatically

  @Column({ nullable: true })
  str_number?: string; // Nomor STR (Surat Tanda Registrasi) for Optometrist

  @Column({ type: 'float', nullable: true, default: 0 })
  chat_commission_percentage?: number; // Komisi untuk layanan chat (dalam persen)

  @Column({ type: 'float', nullable: true, default: 0 })
  video_commission_percentage?: number; // Komisi untuk layanan video call (dalam persen)

  @Column({ type: 'float', nullable: true })
  rating?: number;

  @Column({ type: 'date', nullable: true })
  date_of_birth?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ default: false })
  is_verified!: boolean; // verified by admin for optometrists

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // relations
  @OneToMany(() => Schedule, s => s.optometrist)
  schedules?: Schedule[];

  @OneToMany(() => Appointment, a => a.patient)
  appointments_as_patient?: Appointment[];

  @OneToMany(() => Appointment, a => a.optometrist)
  appointments_as_optometrist?: Appointment[];

  @OneToMany(() => MedicalRecord, m => m.patient)
  medical_records?: MedicalRecord[];

  @OneToMany(() => Order, o => o.patient)
  orders?: Order[];

  @OneToMany(() => Notification, n => n.user)
  notifications?: Notification[];

  @OneToMany(() => ChatMessage, m => m.from)
  messages_sent?: ChatMessage[];

  @OneToMany(() => Review, r => r.optometrist)
  reviews_received?: Review[];
}
