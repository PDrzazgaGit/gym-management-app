import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PassType{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    entry: number;
}