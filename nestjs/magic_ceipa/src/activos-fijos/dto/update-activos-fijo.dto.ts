import { PartialType } from '@nestjs/mapped-types';
import { CreateActivosFijoDto } from './create-activos-fijo.dto';

export class UpdateActivosFijoDto extends PartialType(CreateActivosFijoDto) {}
