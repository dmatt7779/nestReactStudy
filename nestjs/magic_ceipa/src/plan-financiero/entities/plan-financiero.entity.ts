import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PlanFinanciero {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    disponible_inicial: number;

    @Column()
    dias_inventario_inicial: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    financiacion_propia: number;

    @Column()
    plazo_credito: number;

    @Column()
    tasa_credito: number;

    @Column()
    tasa_proveedores: number;

    @Column()
    tmrr: number;

    @Column()
    tasa_reinversion: number;

    @Column()
    impuestos_renta: number;

    @Column()
    dias_cartera: number;

    @Column()
    dias_inventario: number;

    @Column()
    dias_pago_proveedores: number;

    @Column()
    tarfia_ind_ccio: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    gmf4xmil: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    saldo_min_caja: number;

    @Column({ type: 'json' })
    propuesta_financiera: {
        activos_fijos: number[];
        utilidad_neta_dividendo: number[];
    };

}
