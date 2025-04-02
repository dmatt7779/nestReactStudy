import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ActivosFijosService } from './activos-fijos.service';
import { CreateActivosFijoDto } from './dto/create-activos-fijo.dto';
import { UpdateActivosFijoDto } from './dto/update-activos-fijo.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';

@Auth(Role.USER)
@Controller('activos-fijos')
export class ActivosFijosController {
  constructor(private readonly activosFijosService: ActivosFijosService) {}

  @Post(':projectInfoId')
  create(
    @Param('projectInfoId', ParseIntPipe) projectInfoId: number,
    @Body() createActivosFijoDto: CreateActivosFijoDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.activosFijosService.create(createActivosFijoDto, projectInfoId, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface,) {
    return this.activosFijosService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') projectId: number, @ActiveUser() user: UserActiveInterface) {
    return this.activosFijosService.findOne(projectId, user);
  }

  // @Patch(':id')
  // update(@Param('id') id: number, @Body() updateActivosFijoDto: UpdateActivosFijoDto) {
  //   return this.activosFijosService.update(id, updateActivosFijoDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.activosFijosService.remove(id, user);
  }
}
