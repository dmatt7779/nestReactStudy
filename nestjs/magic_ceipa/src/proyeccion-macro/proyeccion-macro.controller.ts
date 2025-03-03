import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProyeccionMacroService } from './proyeccion-macro.service';
import { CreateProyeccionMacroDto } from './dto/create-proyeccion-macro.dto';
import { UpdateProyeccionMacroDto } from './dto/update-proyeccion-macro.dto';

@Controller('proyeccion-macro')
export class ProyeccionMacroController {
  constructor(private readonly proyeccionMacroService: ProyeccionMacroService) {}

  @Post()
  create(@Body() createProyeccionMacroDto: CreateProyeccionMacroDto) {
    return this.proyeccionMacroService.create(createProyeccionMacroDto);
  }

  @Get()
  findAll() {
    return this.proyeccionMacroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.proyeccionMacroService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateProyeccionMacroDto: UpdateProyeccionMacroDto) {
    return this.proyeccionMacroService.update(id, updateProyeccionMacroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.proyeccionMacroService.remove(id);
  }
}
