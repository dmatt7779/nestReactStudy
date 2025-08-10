import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProyeccionMacro } from './proyeccion-macro.entity';

@Entity()
export class EstrategiaMarketing {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProyeccionMacro, proyeccionMacro => proyeccionMacro.estrategiasMarketing, { onDelete: 'CASCADE' })
    proyeccionMacro: ProyeccionMacro;

    @Column()
    nombre: string;

    @Column({ type: 'json' })
    valores: number[];
}