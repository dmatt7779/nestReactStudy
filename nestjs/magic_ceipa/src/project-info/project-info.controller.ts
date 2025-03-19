import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectInfoService } from './project-info.service';
import { CreateProjectInfoDto } from './dto/create-project-info.dto';
import { UpdateProjectInfoDto } from './dto/update-project-info.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';

@Auth(Role.USER)
@Controller('project-info')
export class ProjectInfoController {
  constructor(private readonly projectInfoService: ProjectInfoService) {}

  @Post()
  create(@Body() createProjectInfoDto: CreateProjectInfoDto, @ActiveUser() user: UserActiveInterface) {
    return this.projectInfoService.create(createProjectInfoDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.projectInfoService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.projectInfoService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateProjectInfoDto: UpdateProjectInfoDto, @ActiveUser() user: UserActiveInterface) {
    return this.projectInfoService.update(id, updateProjectInfoDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.projectInfoService.remove(id, user);
  }
}
