import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CostosGastosService } from './costos-gastos.service';
import { CreateCostosGastoDto } from './dto/create-costos-gasto.dto';
import { UpdateCostosGastoDto } from './dto/update-costos-gasto.dto';

@Controller('costos-gastos')
export class CostosGastosController {
  constructor(private readonly costosGastosService: CostosGastosService) {}

  @Post()
  create(@Body() createCostosGastoDto: CreateCostosGastoDto) {
    return this.costosGastosService.create(createCostosGastoDto);
  }

  @Get()
  findAll() {
    return this.costosGastosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.costosGastosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCostosGastoDto: UpdateCostosGastoDto) {
    return this.costosGastosService.update(id, updateCostosGastoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.costosGastosService.remove(id);
  }
}
