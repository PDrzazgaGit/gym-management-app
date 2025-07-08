import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Pass } from "./Pass";

@Entity()
export class Client{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;

    @Column()
    surname: string;

    @Column({ nullable: true, unique: true })
    alias?: string;
    
    @Column()
    phone?: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => Pass)
    @JoinColumn()
    pass?: Pass
}