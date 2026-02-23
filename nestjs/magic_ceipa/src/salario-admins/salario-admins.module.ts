import { Module } from '@nestjs/common';
import { SalarioAdminsService } from './salario-admins.service';
import { SalarioAdminsController } from './salario-admins.controller';
import { SalarioAdmin } from './entities/salario-admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfoModule } from '../project-info/project-info.module';

@Module({
  imports: [TypeOrmModule.forFeature([SalarioAdmin]), ProjectInfoModule],
  controllers: [SalarioAdminsController],
  providers: [SalarioAdminsService],
  exports: [SalarioAdminsModule, SalarioAdminsService],
})
export class SalarioAdminsModule {}
