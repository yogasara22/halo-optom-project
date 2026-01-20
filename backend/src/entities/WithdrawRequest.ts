import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export type WithdrawStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

@Entity('withdraw_requests')
export class WithdrawRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'optometrist_id' })
    optometrist!: User;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount!: number;

    @Column()
    bank_name!: string;

    @Column()
    bank_account_number!: string;

    @Column()
    bank_account_name!: string;

    @Column({
        type: 'enum',
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
        default: 'PENDING'
    })
    status!: WithdrawStatus;

    @CreateDateColumn()
    requested_at!: Date;

    @Column({ type: 'uuid', nullable: true })
    reviewed_by_admin_id?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewed_by_admin_id' })
    reviewed_by_admin?: User;

    @Column({ type: 'timestamp', nullable: true })
    reviewed_at?: Date;

    @Column({ type: 'text', nullable: true })
    note?: string;

    @UpdateDateColumn()
    updated_at!: Date;
}
