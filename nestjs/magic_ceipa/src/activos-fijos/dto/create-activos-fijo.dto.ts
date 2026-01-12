import { IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Items {
    @IsOptional()
    @IsString()
    nombre: string;
    
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(0)
    valor: number;
}

export class ActivoFijoDataDto {
    @ValidateNested({ each: true })
    @Type(() => Items)
    items: Items;

    @IsOptional()
    @IsNumber()
    vidaUtilAnos: number;

    @IsOptional()
    @IsNumber()
    valorSalvamento: number;
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