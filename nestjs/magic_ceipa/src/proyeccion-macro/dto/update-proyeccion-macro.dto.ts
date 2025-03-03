import { PartialType } from '@nestjs/mapped-types';
import { CreateProyeccionMacroDto } from './create-proyeccion-macro.dto';

export class UpdateProyeccionMacroDto extends PartialType(CreateProyeccionMacroDto) {}
