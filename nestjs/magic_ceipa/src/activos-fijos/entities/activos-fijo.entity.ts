import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';

interface Items {
    [key: string]: number | null;
}

interface ActivoFijoData {
    vida_util_anos?: number;
    valor_salvamento?: number;
    items: Items;
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
    activos_fijos: ActivosFijos;

    @BeforeInsert()
    @BeforeUpdate()
    processActivosFijos() {
        for (const key in this.activos_fijos) {
            if (this.activos_fijos.hasOwnProperty(key)) {
                this.activos_fijos[key].items = this.processDynamicKeys(this.activos_fijos[key].items);
            }
        }
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
    }
}