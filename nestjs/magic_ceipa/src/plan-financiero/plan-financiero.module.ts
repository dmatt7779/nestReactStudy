import { Module } from '@nestjs/common';
import { PlanFinancieroService } from './plan-financiero.service';
import { PlanFinancieroController } from './plan-financiero.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanFinanciero } from './entities/plan-financiero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanFinanciero])],
  controllers: [PlanFinancieroController],
  providers: [PlanFinancieroService],
})
export class PlanFinancieroModule {}
