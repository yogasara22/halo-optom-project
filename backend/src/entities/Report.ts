import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    type!: string; // users, orders, appointments, revenue, reviews

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
    status!: ReportStatus;

    @Column({ nullable: true })
    download_url?: string;

    @Column({ type: 'int', default: 0 })
    record_count!: number;

    @Column({ type: 'json', nullable: true })
    metadata?: any; // Store period, filters, etc.

    @CreateDateColumn()
    generated_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
