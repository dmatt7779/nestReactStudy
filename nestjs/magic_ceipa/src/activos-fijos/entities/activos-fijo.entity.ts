import { ProjectInfo } from '../../project-info/entities/project-info.entity';
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

interface ActivoFijoData {
    vidaUtilAnos?: number;
    valorSalvamento?: number;
    items?: any;
}

interface ActivosFijos {
    mueblesEnseres: ActivoFijoData;
    maquinariaEquipos: ActivoFijoData;
    vehiculos: ActivoFijoData;
    terrenos: ActivoFijoData;
    edificaciones: ActivoFijoData;
    equiposComputo: ActivoFijoData;
    activosDiferidos: ActivoFijoData;
}

@Entity()
export class ActivoFijo {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json' })
    activosFijos: ActivosFijos;

    @Column()
    userEmail: string;

    @Column({ name: 'projectInfoId' })
    projectInfoId: number

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
    user: User;

    @OneToOne(() => ProjectInfo, (projectInfo) => projectInfo.proyeccionMacro)
    @JoinColumn({ name: 'projectInfoId' })
    projectInfo: ProjectInfo;
}