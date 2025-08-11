import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pass } from "./Pass";
import { TrainingSessionStatus } from "./TrainingSessionStatus";

@Entity()
export class TrainingSession {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Pass, (pass) => pass.session, {
        onDelete: "CASCADE",
        nullable: false, // ważne — jeśli usuniemy Pass, a tu byłoby nullable, relacja może zostać "osierocona"
    })
    pass: Pass;

    @Column({ nullable: true })
    description?: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    plannedAt?: Date;

    @Column({ nullable: true })
    startsAt?: Date;

    @Column({ nullable: true })
    endedAt?: Date;

    @Column({
        type: "text",
        default: TrainingSessionStatus.PLANNED
    })
    status: TrainingSessionStatus;
}