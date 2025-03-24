import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CostosGastosService } from './costos-gastos.service';
import { CreateCostosGastoDto } from './dto/create-costos-gasto.dto';
import { UpdateCostosGastoDto } from './dto/update-costos-gasto.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';

@Auth(Role.USER)
@Controller('costos-gastos')
export class CostosGastosController {
  constructor(private readonly costosGastosService: CostosGastosService) {}

  @Post(':projectInfoId')
  create(
    @Param('projectInfoId', ParseIntPipe) projectInfoId: number,
    @Body() createCostosGastoDto: CreateCostosGastoDto,
    @ActiveUser() user: UserActiveInterface
  ) {
    return this.costosGastosService.create(createCostosGastoDto, projectInfoId, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.costosGastosService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') projectId: number, @ActiveUser() user: UserActiveInterface) {
    return this.costosGastosService.findOne(projectId, user);
  }

  // @Patch(':id')
  // update(@Param('id') projectId: number, @Body() updateCostosGastoDto: UpdateCostosGastoDto, @ActiveUser() user: UserActiveInterface) {
  //   return this.costosGastosService.update(projectId, updateCostosGastoDto, user);
  // }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.costosGastosService.remove(id, user);
  }
}
