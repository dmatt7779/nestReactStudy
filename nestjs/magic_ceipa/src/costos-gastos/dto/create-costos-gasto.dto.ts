import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmptyObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class IncrementoEgresosDto {
    @IsBoolean()
    otrosPorcentajes: boolean;

    @IsBoolean()
    ipc: boolean;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(4)
    incrementoEgresos: number[];
}

class CostosGastosDto {
    costos: any;
    gastos: any;

    @IsOptional()
    @ValidateNested()
    @Type(() => IncrementoEgresosDto)
    incrementoEgresos: IncrementoEgresosDto;
}

export class CreateCostosGastoDto {
    @IsNotEmptyObject()
    @Type(() => CostosGastosDto)
    costosGastos: CostosGastosDto;
}
