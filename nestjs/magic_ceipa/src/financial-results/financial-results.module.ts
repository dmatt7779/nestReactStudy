import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialResultsService } from './financial-results.service';
import { FinancialResultsController } from './financial-results.controller';
import { FinancialResult } from './entities/financial-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialResult])],
  controllers: [FinancialResultsController],
  providers: [FinancialResultsService],
})
export class FinancialResultsModule {}
