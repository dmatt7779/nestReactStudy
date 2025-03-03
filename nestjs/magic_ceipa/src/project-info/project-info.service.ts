import { Injectable } from '@nestjs/common';
import { CreateProjectInfoDto } from './dto/create-project-info.dto';
import { UpdateProjectInfoDto } from './dto/update-project-info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectInfo } from './entities/project-info.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectInfoService {

  constructor(
      @InjectRepository(ProjectInfo)
      private readonly ProjectInfo: Repository<ProjectInfo>
    ) {}
    
  async create(createProjectInfoDto: CreateProjectInfoDto) {
    try{
        const projectInfo = this.ProjectInfo.create(createProjectInfoDto)
        return await this.ProjectInfo.save(projectInfo);
    }catch (error){
        console.log(error);
    }
  }

  async findAll() {
    return await this.ProjectInfo.find();
  }

  async findOne(id: number) {
    return this.ProjectInfo.findOneBy({id});
  }

  async update(id: number, updateProjectInfoDto: UpdateProjectInfoDto) {
    return await this.ProjectInfo.update(id, updateProjectInfoDto)
  }

  async remove(id: number) {
    return `This action removes a #${id} projectInfo`;
  }
}
