import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('criteria')
export class Criteria {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'enum', enum: ['benefit', 'cost'] })
    type: string;

    @Column({ type: 'float', default: 1 })
    weight: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    color: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    emoji: string;
}