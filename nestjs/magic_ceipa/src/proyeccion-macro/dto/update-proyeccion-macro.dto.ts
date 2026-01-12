import { PartialType } from '@nestjs/mapped-types';
import { CreateProyeccionMacroDto } from './create-proyeccion-macro.dto';
import { DeepPartial } from 'typeorm';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested, ArrayMaxSize, ArrayMinSize, Min, IsPositive, Max } from 'class-validator';

export class ProductoDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    nombre: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    cantidad_facturar: number;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    precio_sin_iva: number;
}

class CrecimientoDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    pib?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    estrategia?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    ipc?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(4)
    crecimiento_cantidades?: number[];
}

class MarketingInvestAnoBaseDto {
    @ApiProperty()
    @IsArray()
    @IsOptional()
    precio: number[];

    @ApiProperty()
    @IsArray()
    @IsOptional()
    producto: number[];

    @ApiProperty()
    @IsArray()
    @IsOptional()
    distribucion: number[];

    @ApiProperty()
    @IsArray()
    @IsOptional()
    comunicacionales: number[];

    @ApiProperty()
    @IsArray()
    @IsOptional()
    comunity_manager: number[];
}

class AnalisisMercadoDto {
    @ApiProperty()
    @IsNumber()
    @Max(100)
    @IsOptional()
    tasa_iva: number;

    @ApiProperty({ type: () => [ProductoDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductoDto)
    @ArrayMaxSize(10)
    @IsOptional()
    productos: ProductoDto[];

    @ApiProperty()
    @ValidateNested()
    @Type(() => CrecimientoDto)
    @IsOptional()
    crecimiento_unidades: CrecimientoDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => CrecimientoDto)
    @IsOptional()
    crecimiento_precios: CrecimientoDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => CrecimientoDto)
    @IsOptional()
    crecimiento_costos: CrecimientoDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => MarketingInvestAnoBaseDto)
    @IsOptional()
    marketing_invest_ano_base: MarketingInvestAnoBaseDto;
}

class proyecciones_macroeconomicasDto {

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsOptional()
    ipc: number[];

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsOptional()
    devaluacion: number[];

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsOptional()
    tasa_interes: number[];

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsOptional()
    pib: number[];
}

export class UpdateProyeccionMacroDto {

    @ApiPropertyOptional({ type: () => Object })
    @IsOptional()
    proyecciones_macroeconomicas?: DeepPartial<proyecciones_macroeconomicasDto>;

    @ApiPropertyOptional({ type: () => Object })
    @IsOptional()
    analisis_mercado?: DeepPartial<AnalisisMercadoDto>;
}