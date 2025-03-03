import { Module } from '@nestjs/common';
import { SalarioAdminsService } from './salario-admins.service';
import { SalarioAdminsController } from './salario-admins.controller';
import { SalarioAdmin } from './entities/salario-admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SalarioAdmin])],
  controllers: [SalarioAdminsController],
  providers: [SalarioAdminsService],
})
export class SalarioAdminsModule {}
