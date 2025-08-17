import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateActivosFijoDto } from './dto/create-activos-fijo.dto';
import { UpdateActivosFijoDto } from './dto/update-activos-fijo.dto';
import { ActivoFijo } from './entities/activos-fijo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectInfoService } from '../project-info/project-info.service';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from 'src/common/enums/rol.enum';

@Injectable()
export class ActivosFijosService {

  constructor(
    @InjectRepository(ActivoFijo)
    private readonly activoFijoRepository: Repository<ActivoFijo>,
    private readonly projectInfoService: ProjectInfoService,
  ) { }

  async create(activosFijos: CreateActivosFijoDto, projectInfoId: number, user: UserActiveInterface) {
    await this.projectInfoService.findOne(projectInfoId, user)
    const isActivosFijos = await this.activoFijoRepository.findOne({
      where: { projectInfoId },
    });
    if(isActivosFijos){
      throw new BadRequestException('ActivosFijos already exists for this project');
    }
    try{
      const activosFijosCreated = this.activoFijoRepository.create({
        activosFijos,
        projectInfo: { id: projectInfoId },
        userEmail: user.email,
      })
      return await this.activoFijoRepository.save(activosFijosCreated);
    }catch (error){
        console.log(error);
    }
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN){
      return await this.activoFijoRepository.find();
    }
    return await this.activoFijoRepository.find({
      where: {userEmail: user.email}
    });
  }

  async findOne(projectInfoId: number, user: UserActiveInterface) {
    const isActivoFijo = await this.activoFijoRepository.findOne({
      where: { projectInfoId },
    });
    if(!isActivoFijo){
      throw new NotFoundException('Project is not found');
    }
    this.validateOwnerShip(isActivoFijo, user)
    return isActivoFijo;
  }

  // async update(id: number, updateActivosFijoDto) {
  //   return await this.activoFijoRepository.update(id, updateActivosFijoDto)
  // }

  async remove(id: number, user: UserActiveInterface) {
    const projectToDelete = await this.findOne(id, user);
    await this.activoFijoRepository.softDelete({id});
    return projectToDelete;
  }

  private validateOwnerShip(project: ActivoFijo, user: UserActiveInterface){
    if(user.role !== Role.ADMIN && project.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
