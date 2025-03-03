import { Module } from '@nestjs/common';
import { CostosGastosService } from './costos-gastos.service';
import { CostosGastosController } from './costos-gastos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostosGasto } from './entities/costos-gasto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CostosGasto])],
  controllers: [CostosGastosController],
  providers: [CostosGastosService],
})
export class CostosGastosModule {}
