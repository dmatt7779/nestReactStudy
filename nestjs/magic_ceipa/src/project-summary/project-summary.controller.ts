import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProjectSummaryService } from './project-summary.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';

@Auth(Role.USER)
@Controller('project-summary')
export class ProjectSummaryController {
  constructor(private readonly projectSummaryService: ProjectSummaryService) {}

  @Get(':projectId')
  getFullProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.projectSummaryService.getFullProject(projectId, user);
  }
}