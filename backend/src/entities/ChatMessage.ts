import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ChatRoom } from './ChatRoom';
import { User } from './User';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ChatRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: ChatRoom;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'from_user_id' })
  from!: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'to_user_id' })
  to?: User;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'json', nullable: true })
  attachments?: any;

  @CreateDateColumn()
  created_at!: Date;
}
