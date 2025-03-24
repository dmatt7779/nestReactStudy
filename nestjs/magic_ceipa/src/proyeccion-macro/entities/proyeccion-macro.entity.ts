import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Producto } from './producto.entity';
import { ProjectInfo } from '../../project-info/entities/project-info.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ProyeccionMacro {
  [x: string]: any;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'json'})
  proyeccionesMacroeconomicas: {
    ipc: number[],
    devaluacion: number[],
    tasaInteres: number[],
    pib: number[]
  }

  @Column({ type: 'json' })
  analisisMercado: {
    tasaIva: number;
    productos: Producto[];
    crecimientoUnidades: {
      pib: boolean;
      estrategia: boolean;
      ipc: boolean;
      crecimientoCantidades: number[];
    };
    crecimientoPrecios: {
      pib: boolean;
      estrategia: boolean;
      ipc: boolean;
      crecimientoCantidades: number[];
    };
    crecimientoCostos: {
      ipc: boolean;
      estrategia: boolean;
      pib: boolean;
      estrategiaValues: number[];
    };
    marketingInvestAnoBase: {
      precio: number[];
      producto: number[];
      distribucion: number[];
      comunicacionales: number[];
      comunityManager: number[];
    };
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email'})
  user: User;

  @Column()
  userEmail: string;

  @OneToOne(() => ProjectInfo, (projectInfo) => projectInfo.proyeccionMacro) // Inverse side of the relation
  @JoinColumn({name: 'projectInfoId'}) //specifies the column name of the joining relation.
  projectInfo: ProjectInfo;

  @Column({name: 'projectInfoId'})
  projectInfoId: number
}