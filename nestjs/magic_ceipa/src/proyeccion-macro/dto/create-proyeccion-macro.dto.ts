import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested, ArrayMaxSize, ArrayMinSize, Min, IsPositive, Max } from 'class-validator';

export class ProductoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  @IsPositive()
  costoVarProdAnoBase: number;

  @IsNumber()
  @IsPositive()
  cantidadFacturar: number;

  @IsNumber()
  @IsPositive()
  precioSinIva: number;

  @IsNumber()
  precioVenta: number;
}

class CrecimientoDto {
    @IsOptional()
    @IsBoolean()
    pib?: boolean;

    @IsOptional()
    @IsBoolean()
    estrategia?: boolean;

    @IsOptional()
    @IsBoolean()
    ipc?: boolean;

    @IsOptional()
    @IsArray()
    crecimientoCantidades?: number[];
}

class MarketingInvestAnoBaseDto {
    @IsArray()
    precio: number[];

    @IsArray()
    producto: number[];

    @IsArray()
    distribucion: number[];

    @IsArray()
    comunicacionales: number[];

    @IsArray()
    comunityManager: number[];
}

class AnalisisMercadoDto {
    @IsNumber()
    @Min(1)
    @Max(100)
    tasaIva: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductoDto)
    @ArrayMaxSize(10)
    productos: ProductoDto[];

    @ValidateNested()
    @Type(() => CrecimientoDto)
    crecimientoUnidades: CrecimientoDto;

    @ValidateNested()
    @Type(() => CrecimientoDto)
    crecimientoPrecios: CrecimientoDto;

    @ValidateNested()
    @Type(() => CrecimientoDto)
    crecimientoCostos: CrecimientoDto;

    @ValidateNested()
    @Type(() => MarketingInvestAnoBaseDto)
    marketingInvestAnoBase: MarketingInvestAnoBaseDto;
}

class proyecciones_macroeconomicasDto {
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  ipc: number[];

  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  devaluacion: number[];

  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  tasaInteres: number[];

  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  pib: number[];
}

export class CreateProyeccionMacroDto {

  @ValidateNested()
  @Type(() => proyecciones_macroeconomicasDto)
  proyeccionesMacroeconomicas: proyecciones_macroeconomicasDto;

  @ValidateNested()
  @Type(() => AnalisisMercadoDto)
  analisisMercado: AnalisisMercadoDto;
}