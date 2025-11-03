import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsPositive, Max, Min, ValidateNested } from "class-validator";

export class PropuestaFinancieraDto {

    @IsArray()
    @IsNumber({}, { each: true })
    activosFijos: number[];

    @IsArray()
    @IsNumber({}, { each: true })
    utilidadNetaDividendo: number[];
}

export class CreatePlanFinancieroDto {
    @IsOptional()
    @IsInt()
    @IsNumber()
    @IsNotEmpty()
    disponibleInicial: number;

    @IsOptional()
    @IsInt()
    @IsNumber()
    @IsNotEmpty()
    diasInventarioInicial: number;

    @IsNumber()
    @IsNotEmpty()
    financiacionPropia: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    plazoCredito: number;

    @IsOptional()
    @IsInt()
    @Max(100)
    @IsNotEmpty()
    tasaCredito: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    tasaProveedores: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    tmrr: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    tasaReinversion: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    impuestosRenta: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    diasCartera: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    diasInventario: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    diasPagoProveedores: number;

    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    tarfiaIndCcio: number;

    @IsNumber()
    @IsNotEmpty()
    gmf4xmil: number;

    @IsNumber()
    @IsNotEmpty()
    saldoMinCaja: number;

    @IsOptional()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => PropuestaFinancieraDto)
    propuestaFinanciera: PropuestaFinancieraDto;
}
