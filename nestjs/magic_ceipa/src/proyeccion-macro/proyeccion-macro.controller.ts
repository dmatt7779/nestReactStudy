import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProyeccionMacroService } from './proyeccion-macro.service';
import { CreateProyeccionMacroDto } from './dto/create-proyeccion-macro.dto';
import { UpdateProyeccionMacroDto } from './dto/update-proyeccion-macro.dto';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';

@Auth(Role.USER)
@Controller('proyeccion-macro')
export class ProyeccionMacroController {
  constructor(private readonly proyeccionMacroService: ProyeccionMacroService) {}

  @Post(':projectInfoId')
  create(
    @Param('projectInfoId', ParseIntPipe) projectInfoId: number,
    @Body() createProyeccionMacroDto: CreateProyeccionMacroDto,
    @ActiveUser() user: UserActiveInterface
  ) {
    return this.proyeccionMacroService.create(createProyeccionMacroDto, projectInfoId, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.proyeccionMacroService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.proyeccionMacroService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateProyeccionMacroDto: UpdateProyeccionMacroDto) {
    return this.proyeccionMacroService.update(id, updateProyeccionMacroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.proyeccionMacroService.remove(id, user);
  }
}
