import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CostosGasto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json' })
    costos_gastos: {
        costos: Record<string, any>;
        gastos: Record<string, any>;
        incremento_egresos: {
            otros_porcentajes: boolean;
            ipc: boolean;
            incremento_egresos: number[];
        };
    };

    @BeforeInsert()
    @BeforeUpdate()
    processCostosGastos() {
        this.costos_gastos.costos = this.processDynamicKeys(this.costos_gastos.costos);
        this.costos_gastos.gastos = this.processDynamicKeys(this.costos_gastos.gastos);
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
}
