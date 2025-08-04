import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pass } from "./Pass";

@Entity()
export class TrainingSession {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Pass, (pass) => pass.session)
    pass: Pass;

    @Column()
    description?: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    startsAt?: Date;

    @Column()
    endedAt?: Date;

    @Column()
    completed?: boolean;
}