import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePlanFinancieroDto } from './dto/create-plan-financiero.dto';
import { UpdatePlanFinancieroDto } from './dto/update-plan-financiero.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanFinanciero } from './entities/plan-financiero.entity';
import { ProjectInfoService } from '../project-info/project-info.service';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from 'src/common/enums/rol.enum';

@Injectable()
export class PlanFinancieroService {
  constructor(
    @InjectRepository(PlanFinanciero)
    private readonly planFinancieroRepository: Repository<PlanFinanciero>,
    private readonly projectInfoService: ProjectInfoService,
  ) {}

  async create(createPlanFinancieroDto: CreatePlanFinancieroDto, projectInfoId: number, user: UserActiveInterface) {
    await this.projectInfoService.findOne(projectInfoId, user);

    // UPSERT LOGIC: Check if it already exists
    const existingPlanFinanciero = await this.planFinancieroRepository.findOne({
      where: { projectInfoId },
    });

    if (existingPlanFinanciero) {
      // Hard delete the parent PlanFinanciero block to make room for the new JSON
      await this.planFinancieroRepository.remove(existingPlanFinanciero);
    }
    
    try {
      const newPlanFinanciero = this.planFinancieroRepository.create({
        planFinanciero: createPlanFinancieroDto,
        projectInfo: { id: projectInfoId },
        userEmail: user.email,
      });
      return await this.planFinancieroRepository.save(newPlanFinanciero);
    } catch (error) {
        console.log(error);
    }
  }

  async findAll(user: UserActiveInterface) {
    if(user.role===Role.ADMIN){
      return await this.planFinancieroRepository.find();
    }
    return await this.planFinancieroRepository.find({
      where: {userEmail: user.email}
    })
  }

  async findOne(projectInfoId: number, user: UserActiveInterface) {
    const isPlanFinanciero = await this.planFinancieroRepository.findOne({
      where: {projectInfoId}
    })
    if(!isPlanFinanciero){
      throw new NotFoundException('Project is not found')
    }
    this.validateOwnerShip(isPlanFinanciero, user)
    return isPlanFinanciero
  }

  // async update(id: number, updatePlanFinancieroDto: UpdatePlanFinancieroDto) {
  //   return await this.planFinancieroRepository.update(id, updatePlanFinancieroDto);
  // }

  async remove(id: number, user: UserActiveInterface) {
    const projectToDelete = await this.findOne(id, user);
    await this.planFinancieroRepository.softDelete({id});
    return projectToDelete;
  }

  private validateOwnerShip(project: PlanFinanciero, user: UserActiveInterface){
    if(user.role !== Role.ADMIN && project.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
