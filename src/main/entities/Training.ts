import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { TrainingSession } from "./TrainingSession";

@Entity()
export class Training{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(() => TrainingSession, (session) => session.training)
    session: TrainingSession[];
}