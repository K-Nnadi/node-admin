import {Column, Entity, JoinColumn, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Role} from "./role.entity";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column({
        unique: true
    })
    lastName: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @ManyToMany(() => Role)
    @JoinColumn({name:"role_id"})
    role: Role;

    
}