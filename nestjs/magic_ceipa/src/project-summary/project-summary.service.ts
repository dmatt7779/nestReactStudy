import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivosFijosService } from '../activos-fijos/activos-fijos.service';
import { CostosGastosService } from '../costos-gastos/costos-gastos.service';
import { PlanFinancieroService } from '../plan-financiero/plan-financiero.service';
import { ProjectInfoService } from '../project-info/project-info.service';
import { ProyeccionMacroService } from '../proyeccion-macro/proyeccion-macro.service';
import { SalarioAdminsService } from '../salario-admins/salario-admins.service';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { FullProjectDto } from './dto/project-summary.dto';

@Injectable()
export class ProjectSummaryService {
  constructor(
    private readonly projectInfoService: ProjectInfoService,
    private readonly proyeccionMacroService: ProyeccionMacroService,
    private readonly costosGastosService: CostosGastosService,
    private readonly activosFijosService: ActivosFijosService,
    private readonly salarioAdminsService: SalarioAdminsService,
    private readonly planFinancieroService: PlanFinancieroService,
  ) {}

  async getFullProject(projectId: number, user: UserActiveInterface): Promise<FullProjectDto> {
    const projectInfo = await this.projectInfoService.findOne(projectId, user);

    if(!projectInfo){
        throw new NotFoundException('Project is not ready to be process');
    }

    const [
      proyeccionMacro,
      costosGastos,
      activosFijos,
      salarioAdmins,
      planFinanciero,
    ] = await Promise.all([
      this.proyeccionMacroService.findOne(projectId, user).catch(e => null),
      this.costosGastosService.findOne(projectId, user).catch(e => null),
      this.activosFijosService.findOne(projectId, user).catch(e => null),
      this.salarioAdminsService.findOne(projectId, user).catch(e => null),
      this.planFinancieroService.findOne(projectId, user).catch(e => null),
    ]);

    const fullProject: FullProjectDto = {
      projectInfo,
      proyeccionMacro,
      costosGastos,
      activosFijos,
      salarioAdmins,
      planFinanciero,
    };
    return fullProject;
  }
}