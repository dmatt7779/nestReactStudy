import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { FinancialResult } from '../financial-results/entities/financial-result.entity';
import { ProjectInfo } from '../project-info/entities/project-info.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialResult, ProjectInfo, User])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
