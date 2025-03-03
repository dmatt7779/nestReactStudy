import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanFinancieroDto } from './create-plan-financiero.dto';

export class UpdatePlanFinancieroDto extends PartialType(CreatePlanFinancieroDto) {}
