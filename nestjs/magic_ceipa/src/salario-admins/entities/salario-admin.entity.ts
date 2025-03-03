import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

interface IncrementoSalarial {
  ipc: boolean;
  otros_porcentajes: boolean;
  incremento_egresos: number[];
}

interface SalarioAdmins {
  [key: string]: number | null | IncrementoSalarial;
  incremento_salarial: IncrementoSalarial;
}

@Entity()
export class SalarioAdmin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  salario_admins: SalarioAdmins;
}