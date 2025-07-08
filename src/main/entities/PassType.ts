import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class PassType{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({unique: true})
    description: string;

    @Column()
    entry: number;
}