import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pass } from "./Pass";
import { Col } from "react-bootstrap/esm";

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
    endedAt?: Date;

    @Column({ default: true })
    confirmed: boolean;
}