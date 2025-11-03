import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProjectInfoDto } from './dto/create-project-info.dto';
import { UpdateProjectInfoDto } from './dto/update-project-info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectInfo } from './entities/project-info.entity';
import { Repository } from 'typeorm';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/rol.enum';

@Injectable()
export class ProjectInfoService {

  constructor(
      @InjectRepository(ProjectInfo)
      private readonly ProjectInfoRepository: Repository<ProjectInfo>
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
    await this.ProjectInfoRepository.softDelete({id});
    return projectToDelete;
  }

  private validateOwnerShip(project: ProjectInfo, user: UserActiveInterface){
    if(user.role !== Role.ADMIN && project.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
