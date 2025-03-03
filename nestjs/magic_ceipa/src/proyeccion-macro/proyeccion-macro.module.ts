import { Module } from '@nestjs/common';
import { ProyeccionMacroService } from './proyeccion-macro.service';
import { ProyeccionMacroController } from './proyeccion-macro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyeccionMacro } from './entities/proyeccion-macro.entity';
import { Producto } from './entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProyeccionMacro, Producto])],
  controllers: [ProyeccionMacroController],
  providers: [ProyeccionMacroService],
})
export class ProyeccionMacroModule {}
