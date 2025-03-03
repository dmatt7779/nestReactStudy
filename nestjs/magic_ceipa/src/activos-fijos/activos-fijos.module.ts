import { Module } from '@nestjs/common';
import { ActivosFijosService } from './activos-fijos.service';
import { ActivosFijosController } from './activos-fijos.controller';
import { ActivoFijo } from './entities/activos-fijo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ActivoFijo])],
  controllers: [ActivosFijosController],
  providers: [ActivosFijosService],
})
export class ActivosFijosModule {}
