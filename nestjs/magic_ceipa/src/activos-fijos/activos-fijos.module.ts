import { Module } from '@nestjs/common';
import { ActivosFijosService } from './activos-fijos.service';
import { ActivosFijosController } from './activos-fijos.controller';
import { ActivoFijo } from './entities/activos-fijo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfoModule } from '../project-info/project-info.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivoFijo]), ProjectInfoModule],
  controllers: [ActivosFijosController],
  providers: [ActivosFijosService],
  exports: [ActivosFijosModule, ActivosFijosService],
})
export class ActivosFijosModule {}
