import { Type } from 'class-transformer';
import { CreateActivosFijoDto } from '../../activos-fijos/dto/create-activos-fijo.dto';
import { CreateCostosGastoDto } from '../../costos-gastos/dto/create-costos-gasto.dto';
import { CreatePlanFinancieroDto } from '../../plan-financiero/dto/create-plan-financiero.dto';
import { CreateProjectInfoDto } from '../../project-info/dto/create-project-info.dto';
import { CreateProyeccionMacroDto } from '../../proyeccion-macro/dto/create-proyeccion-macro.dto';
import { CreateSalarioAdminDto } from '../../salario-admins/dto/create-salario-admin.dto';

export class FullProjectDto {
    @Type(() => CreateProjectInfoDto)
    projectInfo: CreateProjectInfoDto;

    @Type(() => CreateProyeccionMacroDto)
    proyeccionMacro: CreateProyeccionMacroDto;

    @Type(() => CreateCostosGastoDto)
    costosGastos: CreateCostosGastoDto;

    @Type(() => CreateActivosFijoDto)
    activosFijos: CreateActivosFijoDto;

    @Type(() => CreateSalarioAdminDto)
    salarioAdmins: CreateSalarioAdminDto;

    @Type(() => CreatePlanFinancieroDto)
    planFinanciero: CreatePlanFinancieroDto;
}
