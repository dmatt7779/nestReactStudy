import { Module } from '@nestjs/common';
import { PlanFinancieroService } from './plan-financiero.service';
import { PlanFinancieroController } from './plan-financiero.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanFinanciero } from './entities/plan-financiero.entity';
import { ProjectInfoModule } from '../project-info/project-info.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlanFinanciero]), ProjectInfoModule],
  controllers: [PlanFinancieroController],
  providers: [PlanFinancieroService],
  exports: [PlanFinancieroModule, PlanFinancieroService],
})
export class PlanFinancieroModule {}
