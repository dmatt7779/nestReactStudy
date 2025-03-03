import { IsArray, IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IncrementoSalarialDto {
    @IsOptional()
    @IsNotEmpty()
    ipc: boolean;

    @IsOptional()
    @IsNotEmpty()
    otros_porcentajes: boolean;

    @IsOptional()
    @IsNotEmpty()
    @IsArray()
    incremento_egresos: number[];
}

export class CreateSalarioAdminDto {
    @IsObject()
    @IsNotEmptyObject()
    salario_admins: Record<string, any>;

    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => IncrementoSalarialDto)
    incremento_salarial: IncrementoSalarialDto;
}
