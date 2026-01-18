import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { ProyeccionMacro } from './proyeccion-macro.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProyeccionMacro, proyeccionMacro => proyeccionMacro.productos, { onDelete: 'CASCADE' })
    proyeccionMacro: ProyeccionMacro;

    @Column()
    nombre: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cantidadFacturar: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precioSinIva: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    costoVarProdAnoBase: number;

    @DeleteDateColumn()
    deletedAt: Date;
}