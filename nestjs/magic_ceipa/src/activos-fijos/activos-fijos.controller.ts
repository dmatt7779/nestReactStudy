import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivosFijosService } from './activos-fijos.service';
import { CreateActivosFijoDto } from './dto/create-activos-fijo.dto';
import { UpdateActivosFijoDto } from './dto/update-activos-fijo.dto';

@Controller('activos-fijos')
export class ActivosFijosController {
  constructor(private readonly activosFijosService: ActivosFijosService) {}

  @Post()
  create(@Body() createActivosFijoDto: CreateActivosFijoDto) {
    return this.activosFijosService.create(createActivosFijoDto);
  }

  @Get()
  findAll() {
    return this.activosFijosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.activosFijosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateActivosFijoDto: UpdateActivosFijoDto) {
    return this.activosFijosService.update(id, updateActivosFijoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.activosFijosService.remove(id);
  }
}
