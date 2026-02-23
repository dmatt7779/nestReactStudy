import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCostosGastoDto } from './dto/create-costos-gasto.dto';
import { UpdateCostosGastoDto } from './dto/update-costos-gasto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CostosGasto } from './entities/costos-gasto.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ProjectInfoService } from '../project-info/project-info.service';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/rol.enum';

@Injectable()
export class CostosGastosService {
  constructor(
      @InjectRepository(CostosGasto)
      private readonly costosGastoRepository: Repository<CostosGasto>,
      private readonly projectInfoService: ProjectInfoService,
  ) {}
  
  async create(createCostosGastoDto: CreateCostosGastoDto, projectInfoId: number, user: UserActiveInterface) {
    await this.projectInfoService.findOne(projectInfoId, user);

    // UPSERT LOGIC: Check if it already exists
    const existingCostosGastos = await this.costosGastoRepository.findOne({
      where: { projectInfoId },
    });

    if (existingCostosGastos) {
      // Hard delete the parent CostosGasto block to make room for the new JSON
      await this.costosGastoRepository.remove(existingCostosGastos);
    }
    
    try {
      const costosGastos = this.costosGastoRepository.create({
        ...createCostosGastoDto,
        projectInfo: { id: projectInfoId },
        userEmail: user.email,        
      });
      return await this.costosGastoRepository.save(costosGastos);
    } catch (error) {
        console.log(error);
    }
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN){
      return await this.costosGastoRepository.find();
    }
    return await this.costosGastoRepository.find({
      where: {userEmail: user.email}
    });
  }

  async findOne(projectInfoId: number, user: UserActiveInterface) {
    const costosGasto = await this.costosGastoRepository.findOne({
      where: { projectInfoId },
    });
    if(!costosGasto){
      throw new NotFoundException('Project is not found');
    }
    this.validateOwnerShip(costosGasto, user)
    return costosGasto;
  }

  // async update(id: number, updateCostosGastoDto: UpdateCostosGastoDto) {
  //   const where: FindOptionsWhere<CostosGasto> = { id };
  //   return await this.costosGasto.update(where, updateCostosGastoDto);
  // }

  async remove(id: number, user: UserActiveInterface) {
    const projectToDelete = await this.findOne(id, user);
    await this.costosGastoRepository.softDelete({id});
    return projectToDelete;
  }

  private validateOwnerShip(project: CostosGasto, user: UserActiveInterface){
    if(user.role !== Role.ADMIN && project.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
