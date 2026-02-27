import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FinancialResultsService } from './financial-results.service';
import { CreateFinancialResultDto } from './dto/create-financial-result.dto';
import { UpdateFinancialResultDto } from './dto/update-financial-result.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';

@Auth(Role.USER)
@Controller('save-results')
export class FinancialResultsController {
  constructor(private readonly financialResultsService: FinancialResultsService) {}

  @Post(':projectInfoId')
  create(
    @Param('projectInfoId', ParseIntPipe) projectInfoId: number,
    @Body() createFinancialResultDto: CreateFinancialResultDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.financialResultsService.create(createFinancialResultDto, projectInfoId, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.financialResultsService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.financialResultsService.findOne(id, user);
  }

  @Get('project/:projectId')
  @Auth(Role.USER, Role.PROFESSOR)
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.financialResultsService.findByProject(projectId, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFinancialResultDto: UpdateFinancialResultDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.financialResultsService.update(id, updateFinancialResultDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.financialResultsService.remove(id, user);
  }
}
