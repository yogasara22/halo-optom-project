import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('bank_accounts')
export class BankAccount {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    bank_name!: string;

    @Column({ type: 'varchar', length: 50 })
    account_number!: string;

    @Column({ type: 'varchar', length: 100 })
    account_holder_name!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    branch?: string;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
