import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { TrainingSession } from "./TrainingSession";
import { PassType } from "./PassType";
import { Client } from "./Client";

@Entity()
export class Pass{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index({unique: true})
    cardId: string;

    @Column()
    entryLeft: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => PassType)
    @JoinColumn()
    passType: PassType;

    @OneToOne(() => Client, client => client.pass)
    client: Client;

    @OneToMany(() => TrainingSession, (session) => session.pass)
    session: TrainingSession[]
}