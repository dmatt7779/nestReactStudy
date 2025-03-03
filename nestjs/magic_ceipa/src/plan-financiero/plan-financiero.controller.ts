import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanFinancieroService } from './plan-financiero.service';
import { CreatePlanFinancieroDto } from './dto/create-plan-financiero.dto';
import { UpdatePlanFinancieroDto } from './dto/update-plan-financiero.dto';

@Controller('plan-financiero')
export class PlanFinancieroController {
  constructor(private readonly planFinancieroService: PlanFinancieroService) {}

  @Post()
  create(@Body() createPlanFinancieroDto: CreatePlanFinancieroDto) {
    return this.planFinancieroService.create(createPlanFinancieroDto);
  }

  @Get()
  findAll() {
    return this.planFinancieroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.planFinancieroService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePlanFinancieroDto: UpdatePlanFinancieroDto) {
    return this.planFinancieroService.update(id, updatePlanFinancieroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.planFinancieroService.remove(id);
  }
}
