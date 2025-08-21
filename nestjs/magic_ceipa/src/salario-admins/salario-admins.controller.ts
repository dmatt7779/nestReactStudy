import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SalarioAdminsService } from './salario-admins.service';
import { CreateSalarioAdminDto } from './dto/create-salario-admin.dto';
import { UpdateSalarioAdminDto } from './dto/update-salario-admin.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/active-user.interface';

@Auth(Role.USER)
@Controller('salario-admins')
export class SalarioAdminsController {
  constructor(private readonly salarioAdminsService: SalarioAdminsService) {}

  @Post(':projectInfoId')
  create(
    @Param('projectInfoId', ParseIntPipe) projectInfoId: number,
    @Body() createSalarioAdminDto: CreateSalarioAdminDto,
    @ActiveUser() user: UserActiveInterface
  ) {
    return this.salarioAdminsService.create(createSalarioAdminDto, projectInfoId, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.salarioAdminsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') projectId: number, @ActiveUser() user: UserActiveInterface) {
    return this.salarioAdminsService.findOne(projectId, user);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSalarioAdminDto: UpdateSalarioAdminDto) {
  //   return this.salarioAdminsService.update(+id, updateSalarioAdminDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.salarioAdminsService.remove(id, user);
  }
}
