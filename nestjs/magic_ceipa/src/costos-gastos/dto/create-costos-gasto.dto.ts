import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmptyObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class IncrementoEgresosDto {
    @IsBoolean()
    otros_porcentajes: boolean;

    @IsBoolean()
    ipc: boolean;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(4)
    incremento_egresos: number[];
}

class CostosGastosDto {
    costos: any;
    gastos: any;

    @IsOptional()
    @ValidateNested()
    @Type(() => IncrementoEgresosDto)
    incremento_egresos: IncrementoEgresosDto;
}

export class CreateCostosGastoDto {
    @IsNotEmptyObject()
    @Type(() => CostosGastosDto)
    costos_gastos: CostosGastosDto;
}
