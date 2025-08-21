import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IncrementoSalarialDto {
    @IsBoolean()
    @IsOptional()
    ipc: boolean;

    @IsBoolean()
    @IsOptional()
    otroPorcentaje: boolean;

    @IsOptional()
    @IsArray()
    incrementoEgresos: number[];
}

class SalarioAdminDto {
    
    @IsString()
    @IsNotEmpty()
    cargo: string;

    @IsNumber()
    @IsNotEmpty()
    valorMensual: number;

    @IsNumber()
    @IsNotEmpty()
    cargaPrestacional: number;
}

export class CreateSalarioAdminDto {
    @ValidateNested({ each: true })
    @Type(() => SalarioAdminDto)
    salarioAdmins: SalarioAdminDto[];

    @ValidateNested({ each: true })
    @Type(() => IncrementoSalarialDto)
    incrementoSalarial: IncrementoSalarialDto;
}
