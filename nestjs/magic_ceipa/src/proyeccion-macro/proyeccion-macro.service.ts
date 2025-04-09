import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProyeccionMacroDto } from './dto/create-proyeccion-macro.dto';
import { UpdateProyeccionMacroDto } from './dto/update-proyeccion-macro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProyeccionMacro } from './entities/proyeccion-macro.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/rol.enum';
import { ProjectInfoService } from '../project-info/project-info.service';

@Injectable()
export class ProyeccionMacroService {
  constructor(
      @InjectRepository(ProyeccionMacro)
      private readonly ProyeccionMacro: Repository<ProyeccionMacro>,
      private readonly projectInfoService: ProjectInfoService,
  ) {}

  async create(createProyeccionMacroDto: CreateProyeccionMacroDto, projectInfoId: number, user: UserActiveInterface) {
    await this.projectInfoService.findOne(projectInfoId, user)
    const isProyeccionMacro = await this.ProyeccionMacro.findOne({
      where: { projectInfoId },
    });
    if(isProyeccionMacro){
      throw new BadRequestException('ProyeccionMacro already exists for this project');
    }
    try{
      const proyeccionMacro = this.ProyeccionMacro.create({
        ...createProyeccionMacroDto,
        projectInfo: { id: projectInfoId },
        userEmail: user.email,
      });
      return await this.ProyeccionMacro.save(proyeccionMacro);
    }catch (error){
        console.log(error);
    }
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN){
      return await this.ProyeccionMacro.find();
    }
    return await this.ProyeccionMacro.find({
      where: {userEmail: user.email}
    });
  }

  async findOne(projectInfoId: number, user: UserActiveInterface) {
    const proyeccionMacro = await this.ProyeccionMacro.findOne({
      where: { projectInfoId },
    });
    if(!proyeccionMacro){
      throw new NotFoundException('Project is not found');
    }
    this.validateOwnerShip(proyeccionMacro, user)
    return proyeccionMacro;
  }

  async update(id: number, updateProyeccionMacroDto) {
    const where: FindOptionsWhere<ProyeccionMacro> = { id };
    return await this.ProyeccionMacro.update(where, updateProyeccionMacroDto);
  }

  async remove(id: number, user: UserActiveInterface) {
    const projectToDelete = await this.findOne(id, user);
    await this.ProyeccionMacro.softDelete({id});
    return projectToDelete;
  }

  private validateOwnerShip(project: ProyeccionMacro, user: UserActiveInterface){
    if(user.role !== Role.ADMIN && project.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
