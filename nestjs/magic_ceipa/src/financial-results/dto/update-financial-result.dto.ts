import { PartialType } from '@nestjs/swagger';
import { CreateFinancialResultDto } from './create-financial-result.dto';

export class UpdateFinancialResultDto extends PartialType(CreateFinancialResultDto) {}
