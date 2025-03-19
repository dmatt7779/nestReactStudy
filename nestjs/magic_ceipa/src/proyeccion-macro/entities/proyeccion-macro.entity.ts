import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Producto } from './producto.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ProyeccionMacro {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'json'})
  proyecciones_macroeconomicas: {
    ipc: number[],
    devaluacion: number[],
    tasa_interes: number[],
    pib: number[]
  }

  @Column({ type: 'json' })
  analisis_mercado: {
    tasa_iva: number;
    productos: Producto[];
    crecimiento_unidades: {
      pib: boolean;
      estrategia: boolean;
      ipc: boolean;
      crecimiento_cantidades: number[];
    };
    crecimiento_precios: {
      pib: boolean;
      estrategia: boolean;
      ipc: boolean;
      crecimiento_cantidades: number[];
    };
    crecimiento_costos: {
      ipc: boolean;
      estrategia: boolean;
      pib: boolean;
      estrategia_values: number[];
    };
    marketing_invest_ano_base: {
      precio: number[];
      producto: number[];
      distribucion: number[];
      comunicacionales: number[];
      comunity_manager: number[];
    };
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email'})
  user: User;

  @Column()
  userEmail: string;
}