import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { TrainingSession } from "./TrainingSession";
import { PassType } from "./PassType";
import { Client } from "./Client";

@Entity()
export class Pass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index({ unique: true })
    cardId: string;

    @Column()
    entryLeft: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => PassType, passType => passType.passes, { eager: true })
    @JoinColumn({ name: "passTypeId" })
    passType: PassType;

    @OneToMany(() => TrainingSession, (session) => session.pass)
    session: TrainingSession[];

    @OneToOne(() => Client, client => client.pass, { onDelete: "CASCADE" })
    @JoinColumn()
    client: Client;
}

