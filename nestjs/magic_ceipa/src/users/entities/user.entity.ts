
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({unique: true, nullable: true})
    email: string;

    @Column({nullable: true})
    password: string;

    @Column({default: 'user'})
    rol: string;

    @DeleteDateColumn()
    deleteAt: Date;
}
