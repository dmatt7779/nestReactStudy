import { Module } from '@nestjs/common';
import { ActivosFijosService } from './activos-fijos.service';
import { ActivosFijosController } from './activos-fijos.controller';
import { ActivoFijo } from './entities/activos-fijo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfoService } from '../project-info/project-info.service';
import { ProjectInfo } from '../project-info/entities/project-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivoFijo, ProjectInfo])],
  controllers: [ActivosFijosController],
  providers: [ActivosFijosService, ProjectInfoService],
})
export class ActivosFijosModule {}
