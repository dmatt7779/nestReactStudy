import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested, ArrayMaxSize, ArrayMinSize, Min, IsPositive, Max } from 'class-validator';

export class ProductoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  @IsPositive()
  costo_var_prod_ano_base: number;

  @IsNumber()
  @IsPositive()
  cantidad_facturar: number;

  @IsNumber()
  @IsPositive()
  precio_sin_iva: number;

  @IsNumber()
  precio_venta: number;
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
    @ArrayMaxSize(4)
    crecimiento_cantidades?: number[];
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
    comunity_manager: number[];
}

class AnalisisMercadoDto {
    @IsNumber()
    @Min(1)
    @Max(100)
    tasa_iva: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductoDto)
    @ArrayMaxSize(10)
    productos: ProductoDto[];

    @ValidateNested()
    @Type(() => CrecimientoDto)
    crecimiento_unidades: CrecimientoDto;

    @ValidateNested()
    @Type(() => CrecimientoDto)
    crecimiento_precios: CrecimientoDto;

    @ValidateNested()
    @Type(() => CrecimientoDto)
    crecimiento_costos: CrecimientoDto;

    @ValidateNested()
    @Type(() => MarketingInvestAnoBaseDto)
    marketing_invest_ano_base: MarketingInvestAnoBaseDto;
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
  tasa_interes: number[];

  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  pib: number[];
}

export class CreateProyeccionMacroDto {

  @ValidateNested()
  @Type(() => proyecciones_macroeconomicasDto)
  proyecciones_macroeconomicas: proyecciones_macroeconomicasDto;

  @ValidateNested()
  @Type(() => AnalisisMercadoDto)
  analisis_mercado: AnalisisMercadoDto;
}