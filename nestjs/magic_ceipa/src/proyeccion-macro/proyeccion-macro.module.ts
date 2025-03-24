import { Module } from '@nestjs/common';
import { ProyeccionMacroService } from './proyeccion-macro.service';
import { ProyeccionMacroController } from './proyeccion-macro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyeccionMacro } from './entities/proyeccion-macro.entity';
import { Producto } from './entities/producto.entity';
import { ProjectInfoService } from '../project-info/project-info.service';
import { ProjectInfo } from '../project-info/entities/project-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProyeccionMacro, Producto, ProjectInfo])],
  controllers: [ProyeccionMacroController],
  providers: [ProyeccionMacroService, ProjectInfoService],
})
export class ProyeccionMacroModule {}
