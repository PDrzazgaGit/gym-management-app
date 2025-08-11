import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Pass } from "./Pass";

@Entity()
export class PassType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    description: string;

    @Column()
    entry: number;

    @OneToMany(() => Pass, pass => pass.passType)
    passes: Pass[];
}