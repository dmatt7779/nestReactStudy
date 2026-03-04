import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class FinancialResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  result: {
    estadoResultados: object;
    flujoEfectivo: object;
    EstadoSituacionFinanc: object;
    flujoCaja: object;
    wacc: object;
    indLiquidez: object;
    indEndeudamiento: object;
    indRentabilidad: object;
    indGeneracionValor: object;
    excelPath?: string;
  };

  @Column()
  projectInfoId: number;

  @Column()
  userEmail: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ type: 'datetime', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'json', nullable: true })
  comments: {
    estadoResultados?: string;
    flujoEfectivo?: string;
    estadoSituacionFinanc?: string;
    flujoCaja?: string;
    wacc?: string;
    indiFinancieros?: string;
    indicadores?: string;
  };
}
