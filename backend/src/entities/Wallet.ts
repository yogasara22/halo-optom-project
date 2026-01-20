import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export type WalletRole = 'optometris';

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'enum', enum: ['optometris'], default: 'optometris' })
    role!: WalletRole;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    balance!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    hold_balance!: number;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
