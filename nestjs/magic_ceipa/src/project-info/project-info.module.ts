import { Module } from '@nestjs/common';
import { ProjectInfoService } from './project-info.service';
import { ProjectInfoController } from './project-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfo } from './entities/project-info.entity';
import { PlanFinanciero } from '../plan-financiero/entities/plan-financiero.entity';
import { CostosGasto } from '../costos-gastos/entities/costos-gasto.entity';
import { ActivoFijo } from '../activos-fijos/entities/activos-fijo.entity';
import { SalarioAdmin } from '../salario-admins/entities/salario-admin.entity';
import { ProyeccionMacro } from '../proyeccion-macro/entities/proyeccion-macro.entity';
import { FinancialResult } from '../financial-results/entities/financial-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectInfo,
      PlanFinanciero,
      CostosGasto,
      ActivoFijo,
      SalarioAdmin,
      ProyeccionMacro,
      FinancialResult,
    ]),
  ],
  controllers: [ProjectInfoController],
  providers: [ProjectInfoService],
  exports: [ProjectInfoService, ProjectInfoModule],
})
export class ProjectInfoModule {}
