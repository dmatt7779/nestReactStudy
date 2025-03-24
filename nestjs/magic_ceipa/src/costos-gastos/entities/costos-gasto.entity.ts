import { ProjectInfo } from "../../project-info/entities/project-info.entity";
import { User } from "../../users/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CostosGasto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json' })
    costosGastos: {
        costos: Record<string, any>;
        gastos: Record<string, any>;
        incrementoEgresos: {
            otrosPorcentajes: boolean;
            ipc: boolean;
            incrementoEgresos: number[];
        };
    };

    @BeforeInsert()
    @BeforeUpdate()
    processCostosGastos() {
        this.costosGastos.costos = this.processDynamicKeys(this.costosGastos.costos);
        this.costosGastos.gastos = this.processDynamicKeys(this.costosGastos.gastos);
    }

    private processDynamicKeys(obj: any) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                let newKey = key.toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                newObj[newKey] = typeof obj[key] === 'object' ? this.processDynamicKeys(obj[key]) : obj[key];
            }
        }
        return newObj;
    };

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
    user: User;

    @Column()
    userEmail: string;

    @OneToOne(() => ProjectInfo, (projectInfo) => projectInfo.proyeccionMacro)
    @JoinColumn({ name: 'projectInfoId' })
    projectInfo: ProjectInfo;

    @Column({ name: 'projectInfoId' })
    projectInfoId: number
}
