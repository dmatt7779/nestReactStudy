import { IsNotEmpty, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

interface Items {
    [key: string]: number;
}

export class ActivoFijoDataDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    vidaUtilAnos?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    valorSalvamento?: number;

    @ApiProperty({type: 'object', additionalProperties: { type: 'number'}})
    @IsNotEmpty()
    // @Type(() => ItemDto)
    items: Items;
}


export class CreateActivosFijoDto {
    @ApiProperty()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    mueblesEnseres: ActivoFijoDataDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    maquinariaEquipos: ActivoFijoDataDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    vehiculos: ActivoFijoDataDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    terrenos: ActivoFijoDataDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    edificaciones: ActivoFijoDataDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    equiposComputo: ActivoFijoDataDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => ActivoFijoDataDto)
    activosDiferidos: ActivoFijoDataDto;
}