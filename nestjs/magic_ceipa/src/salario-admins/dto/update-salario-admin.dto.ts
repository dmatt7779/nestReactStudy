import { PartialType } from '@nestjs/mapped-types';
import { CreateSalarioAdminDto } from './create-salario-admin.dto';

export class UpdateSalarioAdminDto extends PartialType(CreateSalarioAdminDto) {}
