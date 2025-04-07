import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pass } from "./Pass";

@Entity()
export class Client{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;

    @Column()
    surname: string;
    
    @Column()
    phone: number;

    @OneToOne(() => Pass)
    @JoinColumn()
    pass?: Pass
}