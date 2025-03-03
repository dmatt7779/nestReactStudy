import { PartialType } from '@nestjs/mapped-types';
import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmptyObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IncrementoEgresosDto } from './create-costos-gasto.dto';

export class UpdateIncrementoEgresosDto extends PartialType(IncrementoEgresosDto) {}

class UpdateIncrementoEgresosDataDto {
    @IsOptional()    
    @IsBoolean()
    otros_porcentajes?: boolean;

    @IsOptional()
    @IsBoolean()
    ipc?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(4)
    incremento_egresos?: number[];
}

class UpdateCostosGastosDataDto {
    @IsOptional()
    costos?: any;

    @IsOptional()
    gastos?: any;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateIncrementoEgresosDto)
    incremento_egresos?: UpdateIncrementoEgresosDto;
}

export class UpdateCostosGastoDto {
    @IsOptional()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => UpdateCostosGastosDataDto)
    costos_gastos?: UpdateCostosGastosDataDto;
}

