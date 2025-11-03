import { ProjectInfo } from 'src/project-info/entities/project-info.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

interface IncrementoSalarial {
  ipc: boolean;
  otroPorcentaje: boolean;
  incrementoEgresos: number[];
}

interface SalarioAdminItem{
    cargo: string;
    valorMensual: number;
}

interface SalarioAdmins {
  salarioAdmins: SalarioAdminItem[];
  incrementoSalarial: IncrementoSalarial;
}

@Entity()
export class SalarioAdmin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  salarioAdmins: SalarioAdmins;

  @Column()
  userEmail: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  @OneToOne(() => ProjectInfo, projectInfo => projectInfo.costosGastos)
  @JoinColumn({ name: 'projectInfoId' })
  projectInfo: ProjectInfo;
}