import { Module } from '@nestjs/common';
import { SalarioAdminsService } from './salario-admins.service';
import { SalarioAdminsController } from './salario-admins.controller';
import { SalarioAdmin } from './entities/salario-admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfo } from '../project-info/entities/project-info.entity';
import { ProjectInfoService } from '../project-info/project-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalarioAdmin, ProjectInfo])],
  controllers: [SalarioAdminsController],
  providers: [SalarioAdminsService, ProjectInfoService],
  exports: [SalarioAdminsModule, SalarioAdminsService],
})
export class SalarioAdminsModule {}
