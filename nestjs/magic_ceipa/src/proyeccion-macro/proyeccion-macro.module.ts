import { Module } from '@nestjs/common';
import { ProyeccionMacroService } from './proyeccion-macro.service';
import { ProyeccionMacroController } from './proyeccion-macro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyeccionMacro } from './entities/proyeccion-macro.entity';
import { Producto } from './entities/producto.entity';
import { ProjectInfoModule } from '../project-info/project-info.module';
import { EstrategiaMarketing } from './entities/estrategia-marketing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProyeccionMacro, Producto, EstrategiaMarketing]), ProjectInfoModule],
  controllers: [ProyeccionMacroController],
  providers: [ProyeccionMacroService],
  exports: [ProyeccionMacroModule, ProyeccionMacroService],
})
export class ProyeccionMacroModule {}
