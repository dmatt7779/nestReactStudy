import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { Producto } from './producto.entity';
import { ProjectInfo } from '../../project-info/entities/project-info.entity';
import { User } from '../../users/entities/user.entity';
import { EstrategiaMarketing } from './estrategia-marketing.entity';

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
  };

  @OneToMany(() => Producto, producto => producto.proyeccionMacro, { cascade: true })
  producto: Producto[];

  @OneToMany(() => EstrategiaMarketing, estrategia => estrategia.proyeccionMacro, { cascade: true })
  estrategiaMarketing: EstrategiaMarketing[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email'})
  user: User;

  @Column()
  userEmail: string;

  @OneToOne(() => ProjectInfo, (projectInfo) => projectInfo.proyeccionMacro)
  @JoinColumn({name: 'projectInfoId'})
  projectInfo: ProjectInfo;

  @Column({name: 'projectInfoId'})
  projectInfoId: number
}