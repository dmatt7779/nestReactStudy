import { Module } from '@nestjs/common';
import { CostosGastosService } from './costos-gastos.service';
import { CostosGastosController } from './costos-gastos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostosGasto } from './entities/costos-gasto.entity';
import { ProjectInfoModule } from '../project-info/project-info.module';

@Module({
  imports: [TypeOrmModule.forFeature([CostosGasto]), ProjectInfoModule],
  controllers: [CostosGastosController],
  providers: [CostosGastosService],
  exports: [CostosGastosModule, CostosGastosService],
})
export class CostosGastosModule {}
