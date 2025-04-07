import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Training } from "./Training";
import { Pass } from "./Pass";

@Entity()
export class TrainingSession {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Pass, (pass) => pass.session)
    pass: Pass;

    @ManyToOne(() => Training, (training) => training.session)
    training: Training;

    @Column()
    trainingDate: Date;

    @Column()
    createdAt: Date;

    @Column()
    startedAt: Date;

    @Column()
    endedAt: Date;

    @Column({ default: false })
    confirmed: boolean;
}