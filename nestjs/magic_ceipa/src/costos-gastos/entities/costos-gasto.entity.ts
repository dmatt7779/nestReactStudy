import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    JoinColumn, 
    ManyToOne
} from 'typeorm';
import { ProjectInfo } from '../../project-info/entities/project-info.entity';
import { User } from 'src/users/entities/user.entity';

interface ICostoGastoItem {
    nombre: string;
    valor: number;
}

interface IncrementoEgresos {
    pib: boolean;
    ipc: boolean;
    estrategia: boolean;
    incrementoEgresosCantidades: number[];
}

@Entity('costos_gastos')
export class CostosGasto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json' })
    costos: ICostoGastoItem[];

    @Column({ type: 'json' })
    gastos: ICostoGastoItem[];

    @Column()
    projectInfoId: number;

    @Column()
    userEmail: string;

    @Column({ type: 'json' })
    incrementoEgresos: IncrementoEgresos;

    @Column({ type: 'float', default: 0, nullable: true })
    gastosConstitucion: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
    user: User;

    @OneToOne(() => ProjectInfo, projectInfo => projectInfo.costosGastos)
    @JoinColumn({ name: 'projectInfoId' })
    projectInfo: ProjectInfo;

}