import { ProjectInfo } from "../../project-info/entities/project-info.entity";
import { User } from "../../users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

interface PropuestaFinanciera {
    activosFijos: number[];
    utilidadNetaDividendo: number[];
}
interface PlanFinancieroInterface {
    disponibleInicial: number;
    diasInventarioInicial: number;
    financiacionPropia: number;
    plazoCredito: number;
    tasaCredito: number;
    tasaProveedores: number;
    tmrr: number;
    tasaReinversion: number;
    impuestosRenta: number;
    diasCartera: number;
    diasInventario: number;
    diasPagoProveedores: number;
    tarfiaIndCcio: number;
    gmf4xmil: number;
    saldoMinCaja: number;
    propuestaFinanciera: PropuestaFinanciera;
}
@Entity()
export class PlanFinanciero {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json' })
    planFinanciero: PlanFinancieroInterface;

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
