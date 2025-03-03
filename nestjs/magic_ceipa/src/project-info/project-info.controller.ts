import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectInfoService } from './project-info.service';
import { CreateProjectInfoDto } from './dto/create-project-info.dto';
import { UpdateProjectInfoDto } from './dto/update-project-info.dto';

@Controller('project-info')
export class ProjectInfoController {
  constructor(private readonly projectInfoService: ProjectInfoService) {}

  @Post()
  create(@Body() createProjectInfoDto: CreateProjectInfoDto) {
    return this.projectInfoService.create(createProjectInfoDto);
  }

  @Get()
  findAll() {
    return this.projectInfoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.projectInfoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateProjectInfoDto: UpdateProjectInfoDto) {
    return this.projectInfoService.update(id, updateProjectInfoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.projectInfoService.remove(id);
  }
}
