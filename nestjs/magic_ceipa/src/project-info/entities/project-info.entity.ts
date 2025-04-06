import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn, OneToOne } from 'typeorm';
import { ProyeccionMacro } from '../../proyeccion-macro/entities/proyeccion-macro.entity';
import { CostosGasto } from '../../costos-gastos/entities/costos-gasto.entity';
import { ActivoFijo } from '../../activos-fijos/entities/activos-fijo.entity';

@Entity()
export class ProjectInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectName: string;

  @Column('simple-array')
  teamMembers: string[];

  @Column()
  openingYear: number;

  @Column('simple-array')
  professor: number[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email'})
  user: User;

  @Column()
  userEmail: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => ProyeccionMacro, (proyeccionMacro) => proyeccionMacro.projectInfo, { cascade: true, eager: true })
  @JoinColumn()
  proyeccionMacro: ProyeccionMacro;

  @OneToOne(() => CostosGasto, (costosGastos) => costosGastos.projectInfo, { cascade: true, eager: true })
  @JoinColumn()
  costosGastos: CostosGasto;

  @OneToOne(() => ActivoFijo, (activosFijos) => activosFijos.projectInfo, { cascade: true, eager: true })
  @JoinColumn()
  activosFijos: ActivoFijo;
}