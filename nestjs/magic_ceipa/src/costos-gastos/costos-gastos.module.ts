import { Module } from '@nestjs/common';
import { CostosGastosService } from './costos-gastos.service';
import { CostosGastosController } from './costos-gastos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostosGasto } from './entities/costos-gasto.entity';
import { ProjectInfoService } from '../project-info/project-info.service';
import { ProjectInfo } from '../project-info/entities/project-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CostosGasto, ProjectInfo])],
  controllers: [CostosGastosController],
  providers: [CostosGastosService, ProjectInfoService],
  exports: [CostosGastosModule, CostosGastosService],
})
export class CostosGastosModule {}
