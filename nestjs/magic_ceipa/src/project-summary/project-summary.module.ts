import { Module } from '@nestjs/common';
import { ProjectSummaryService } from './project-summary.service';
import { ProjectSummaryController } from './project-summary.controller';
import { ProjectInfoModule } from '../project-info/project-info.module';
import { ProyeccionMacroModule } from '../proyeccion-macro/proyeccion-macro.module';
import { CostosGastosModule } from '../costos-gastos/costos-gastos.module';
import { ActivosFijosModule } from '../activos-fijos/activos-fijos.module';
import { SalarioAdminsModule } from '../salario-admins/salario-admins.module';
import { PlanFinancieroModule } from 'src/plan-financiero/plan-financiero.module';

@Module({
  imports: [
    ProjectInfoModule,
    ProyeccionMacroModule,
    CostosGastosModule,
    ActivosFijosModule,
    SalarioAdminsModule,
    PlanFinancieroModule
  ],
  controllers: [ProjectSummaryController],
  providers: [ProjectSummaryService],
  exports: [ProjectSummaryService]
})
export class ProjectSummaryModule {}
