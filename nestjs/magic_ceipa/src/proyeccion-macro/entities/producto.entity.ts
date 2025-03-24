import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { ProyeccionMacro } from './proyeccion-macro.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProyeccionMacro, proyeccion_macro => proyeccion_macro.analisis_mercado.productos, { onDelete: 'CASCADE' })
    proyeccion_macro: ProyeccionMacro;

    @Column()
    nombre: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    costo_var_prod_ano_base: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cantidad_facturar: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_sin_iva: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_venta: number;

    @DeleteDateColumn()
    deletedAt: Date;
}