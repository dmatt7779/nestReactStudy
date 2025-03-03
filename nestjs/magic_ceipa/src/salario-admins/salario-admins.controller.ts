import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SalarioAdminsService } from './salario-admins.service';
import { CreateSalarioAdminDto } from './dto/create-salario-admin.dto';
import { UpdateSalarioAdminDto } from './dto/update-salario-admin.dto';

@Controller('salario-admins')
export class SalarioAdminsController {
  constructor(private readonly salarioAdminsService: SalarioAdminsService) {}

  @Post()
  create(@Body() createSalarioAdminDto: CreateSalarioAdminDto) {
    return this.salarioAdminsService.create(createSalarioAdminDto);
  }

  @Get()
  findAll() {
    return this.salarioAdminsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salarioAdminsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalarioAdminDto: UpdateSalarioAdminDto) {
    return this.salarioAdminsService.update(+id, updateSalarioAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salarioAdminsService.remove(+id);
  }
}
