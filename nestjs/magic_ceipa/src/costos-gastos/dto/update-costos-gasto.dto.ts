import { PartialType } from '@nestjs/mapped-types';
import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmptyObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IncrementoEgresosDto } from './create-costos-gasto.dto';

export class UpdateIncrementoEgresosDto extends PartialType(IncrementoEgresosDto) {}

class UpdateIncrementoEgresosDataDto {
    @IsOptional()    
    @IsBoolean()
    pib?: boolean;

    @IsOptional()
    @IsBoolean()
    ipc?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(4)
    estrategia?: number[];
}

class UpdateCostosGastosDataDto {
    @IsOptional()
    costos?: any;

    @IsOptional()
    gastos?: any;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateIncrementoEgresosDto)
    incrementoEgresosCantidades?: UpdateIncrementoEgresosDto;
}

export class UpdateCostosGastoDto {
    @IsOptional()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => UpdateCostosGastosDataDto)
    costos_gastos?: UpdateCostosGastosDataDto;
}

