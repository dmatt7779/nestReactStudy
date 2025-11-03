import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PlanFinancieroService } from './plan-financiero.service';
import { CreatePlanFinancieroDto } from './dto/create-plan-financiero.dto';
import { UpdatePlanFinancieroDto } from './dto/update-plan-financiero.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';

@Auth(Role.USER)
@Controller('plan-financiero')
export class PlanFinancieroController {
  constructor(private readonly planFinancieroService: PlanFinancieroService) {}

  @Post(':projectInfoId')
  create(
    @Param('projectInfoId', ParseIntPipe) projectInfoId: number,
    @Body() createPlanFinancieroDto: CreatePlanFinancieroDto, 
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.planFinancieroService.create(createPlanFinancieroDto, projectInfoId, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.planFinancieroService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') projectId: number, @ActiveUser() user: UserActiveInterface) {
    return this.planFinancieroService.findOne(projectId, user);
  }

  // @Patch(':id')
  // update(@Param('id') id: number, @Body() updatePlanFinancieroDto: UpdatePlanFinancieroDto) {
  //   return this.planFinancieroService.update(id, updatePlanFinancieroDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.planFinancieroService.remove(id, user);
  }
}
