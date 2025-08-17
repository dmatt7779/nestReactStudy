import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class Items {
    @IsOptional()
    @IsString()
    nombre: string;
    
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(0)
    valor: number;
    
    @IsOptional()
    @IsNumber()
    @IsPositive()
    vidaUtilAnos: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    valorSalvamento: number;
}

export class ActivoFijoDataDto {
    @ValidateNested({ each: true })
    @Type(() => Items)
    items: Items;
}


export class CreateActivosFijoDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    mueblesEnseres: ActivoFijoDataDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    maquinariaEquipos: ActivoFijoDataDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    vehiculos: ActivoFijoDataDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    terrenos: ActivoFijoDataDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    edificaciones: ActivoFijoDataDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    equiposComputo: ActivoFijoDataDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    activosDiferidos: ActivoFijoDataDto;
}