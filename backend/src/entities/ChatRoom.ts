import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  appointment_id?: string; // optional link to appointment

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'chat_room_participants',
    joinColumn: { name: 'chat_room_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  participants!: User[];

  @CreateDateColumn()
  created_at!: Date;
}
