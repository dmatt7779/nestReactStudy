import { Module } from '@nestjs/common';
import { PlanFinancieroService } from './plan-financiero.service';
import { PlanFinancieroController } from './plan-financiero.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanFinanciero } from './entities/plan-financiero.entity';
import { ProjectInfo } from '../project-info/entities/project-info.entity';
import { ProjectInfoService } from '../project-info/project-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanFinanciero, ProjectInfo])],
  controllers: [PlanFinancieroController],
  providers: [PlanFinancieroService, ProjectInfoService],
  exports: [PlanFinancieroModule, PlanFinancieroService],
})
export class PlanFinancieroModule {}
