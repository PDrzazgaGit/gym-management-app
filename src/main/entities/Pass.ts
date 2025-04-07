import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { TrainingSession } from "./TrainingSession";
import { PassType } from "./PassType";

@Entity()
export class Pass{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index({unique: true})
    cardId: string;

    @Column()
    entryLeft: number;

    @Column()
    renewalDate: Date;

    @OneToOne(() => PassType)
    @JoinColumn()
    passType: PassType;

    @OneToMany(() => TrainingSession, (session) => session.pass)
    session: TrainingSession[]
}