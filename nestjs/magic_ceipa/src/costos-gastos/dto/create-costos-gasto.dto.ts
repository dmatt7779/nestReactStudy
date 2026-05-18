import { IsArray, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CostoGastoItemDto } from './costos-gasto-item.dto';
import { IncrementoEgresosDto } from './increment-egresos.dto';

export class CreateCostosGastoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostoGastoItemDto)
  costos: CostoGastoItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostoGastoItemDto)
  gastos: CostoGastoItemDto[];

  @ValidateNested({ each: true })
  @Type(() => IncrementoEgresosDto)
  incrementoEgresos: IncrementoEgresosDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gastosConstitucion?: number;
}

export { IncrementoEgresosDto };
