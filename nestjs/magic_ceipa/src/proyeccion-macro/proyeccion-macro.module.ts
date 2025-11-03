import { Module } from '@nestjs/common';
import { ProyeccionMacroService } from './proyeccion-macro.service';
import { ProyeccionMacroController } from './proyeccion-macro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyeccionMacro } from './entities/proyeccion-macro.entity';
import { Producto } from './entities/producto.entity';
import { ProjectInfoService } from '../project-info/project-info.service';
import { ProjectInfo } from '../project-info/entities/project-info.entity';
import { EstrategiaMarketing } from './entities/estrategia-marketing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProyeccionMacro, Producto, EstrategiaMarketing, ProjectInfo])],
  controllers: [ProyeccionMacroController],
  providers: [ProyeccionMacroService, ProjectInfoService],
  exports: [ProyeccionMacroModule, ProyeccionMacroService],
})
export class ProyeccionMacroModule {}
