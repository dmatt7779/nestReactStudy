import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialResultsService } from './financial-results.service';
import { FinancialResultsController } from './financial-results.controller';
import { FinancialResult } from './entities/financial-result.entity';
import { ProjectInfo } from '../project-info/entities/project-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialResult, ProjectInfo])],
  controllers: [FinancialResultsController],
  providers: [FinancialResultsService],
})
export class FinancialResultsModule {}
