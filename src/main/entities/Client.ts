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

    @Column({ nullable: true, unique: true })
    alias?: string;
    
    @Column()
    phone: string;

   // @Column()
   // CreatedAt: Date;

    @OneToOne(() => Pass)
    @JoinColumn()
    pass?: Pass
}