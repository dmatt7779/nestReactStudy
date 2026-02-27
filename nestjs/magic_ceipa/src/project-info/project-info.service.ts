import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProjectInfoDto } from './dto/create-project-info.dto';
import { UpdateProjectInfoDto } from './dto/update-project-info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectInfo } from './entities/project-info.entity';
import { Repository } from 'typeorm';
import { PlanFinanciero } from '../plan-financiero/entities/plan-financiero.entity';
import { CostosGasto } from '../costos-gastos/entities/costos-gasto.entity';
import { ActivoFijo } from '../activos-fijos/entities/activos-fijo.entity';
import { SalarioAdmin } from '../salario-admins/entities/salario-admin.entity';
import { ProyeccionMacro } from '../proyeccion-macro/entities/proyeccion-macro.entity';
import { FinancialResult } from '../financial-results/entities/financial-result.entity';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/rol.enum';

@Injectable()
export class ProjectInfoService {

  constructor(
      @InjectRepository(ProjectInfo)
      private readonly ProjectInfoRepository: Repository<ProjectInfo>,
      @InjectRepository(PlanFinanciero)
      private readonly planFinancieroRepository: Repository<PlanFinanciero>,
      @InjectRepository(CostosGasto)
      private readonly costosGastoRepository: Repository<CostosGasto>,
      @InjectRepository(ActivoFijo)
      private readonly activoFijoRepository: Repository<ActivoFijo>,
      @InjectRepository(SalarioAdmin)
      private readonly salarioAdminRepository: Repository<SalarioAdmin>,
      @InjectRepository(ProyeccionMacro)
      private readonly proyeccionMacroRepository: Repository<ProyeccionMacro>,
      @InjectRepository(FinancialResult)
      private readonly financialResultRepository: Repository<FinancialResult>,
  ) {}
    
  async create(createProjectInfoDto: CreateProjectInfoDto, user: UserActiveInterface) {
    const isProjectExist = await this.findProjectByOneByEmail(createProjectInfoDto.projectName, user.email)
    if(isProjectExist){
      throw new BadRequestException("Project already exist")
    }
    try{
        const project = this.ProjectInfoRepository.create(createProjectInfoDto)
        return await this.ProjectInfoRepository.save({
          ...project,
          userEmail: user.email
        });
    }catch (error){
        console.log(error);
    }
  }

  async findProjectByOneByEmail(projectName: string, email: string){
    return await this.ProjectInfoRepository.findOne({
      where: {projectName: projectName, userEmail: email},
      select: ['id', 'projectName', 'teamMembers', 'openingYear', 'professor', 'userEmail']
    })
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN){
      return await this.ProjectInfoRepository.find();
    }
    return await this.ProjectInfoRepository.find({
      where: {userEmail: user.email}
    });
  }

  async findProfessorDashboard(user: UserActiveInterface) {
    // 1. Obtener todos los resultados financieros existentes
    const financialResults = await this.financialResultRepository.find({
      select: ['projectInfoId']
    });

    const projectIdsWithResults = financialResults.map(fr => fr.projectInfoId);

    if (projectIdsWithResults.length === 0) {
      return [];
    }

    // 2. Buscar los proyectos asociados a esos resultados
    // Usamos QueryBuilder para buscar los IDs de la lista y traer la relación mínima necesaria si se desea
    const projects = await this.ProjectInfoRepository.createQueryBuilder('project')
      .where('project.id IN (:...ids)', { ids: projectIdsWithResults })
      .getMany();

    // 3. Filtrar aquellos donde el ID del profesor actual esté en el arreglo "professor"
    // Nota: Como es un 'simple-array' en base de datos, TypeORM lo trae como array de strings o números dependiendo de la BD.
    // Hacemos el mapeo a número seguro para la validación.
    const professorProjects = projects.filter(project => {
      if (!project.professor) return false;
      const professorIds = project.professor.map(id => Number(id));
      return professorIds.includes(user.id);
    });

    return professorProjects;
  }

  async findOne(id: number, user: UserActiveInterface) {
    const project = await this.ProjectInfoRepository.findOne({
      where: { id },
      relations: ['proyeccionMacro'],
    });
    if(!project){
      throw new BadRequestException('Project is not found');
    }
    this.validateOwnerShip(project, user);
    return project;
  }

  async update(id: number, updateProjectInfoDto: UpdateProjectInfoDto, user: UserActiveInterface) {
    await this.findOne(id, user);
    return await this.ProjectInfoRepository.update(id, updateProjectInfoDto)
  }

  async remove(id: number, user: UserActiveInterface) {
    const projectToDelete = await this.findOne(id, user);

    // Hard delete related entities manually to bypass missing DB foreign key cascades
    const planFinanciero = await this.planFinancieroRepository.findOne({ where: { projectInfoId: id } });
    if (planFinanciero) await this.planFinancieroRepository.remove(planFinanciero);

    const salarioAdmin = await this.salarioAdminRepository.findOne({ where: { projectInfo: { id } } });
    if (salarioAdmin) await this.salarioAdminRepository.remove(salarioAdmin);

    const activoFijo = await this.activoFijoRepository.findOne({ where: { projectInfoId: id } });
    if (activoFijo) await this.activoFijoRepository.remove(activoFijo);

    const costosGasto = await this.costosGastoRepository.findOne({ where: { projectInfoId: id } });
    if (costosGasto) await this.costosGastoRepository.remove(costosGasto);

    // ProyeccionMacro needs relations loaded to cascade delete its nested entities (Producto, EstrategiaMarketing)
    const proyeccionMacro = await this.proyeccionMacroRepository.findOne({ 
      where: { projectInfoId: id },
      relations: ['producto', 'estrategiaMarketing'], 
    });
    if (proyeccionMacro) await this.proyeccionMacroRepository.remove(proyeccionMacro);

    const financialResult = await this.financialResultRepository.findOne({ where: { projectInfoId: id } });
    if (financialResult) await this.financialResultRepository.remove(financialResult);

    // Finally, hard delete the main project using .delete() which skips soft deletion
    await this.ProjectInfoRepository.delete({ id });
    return projectToDelete;
  }

  private validateOwnerShip(project: ProjectInfo, user: UserActiveInterface){
    if(user.role !== Role.ADMIN && project.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
