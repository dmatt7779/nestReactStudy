import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNotEmptyObject, IsNumber, IsPositive, Max, Min, ValidateNested } from "class-validator";

export class PropuestaFinancieraDto {

    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsNumber({}, { each: true })
    activos_fijos: number[];

    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @IsNumber({}, { each: true })
    utilidad_neta_dividendo: number[];
}

export class CreatePlanFinancieroDto {
    @IsInt()
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    disponible_inicial: number;

    @IsInt()
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    dias_inventario_inicial: number;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    financiacion_propia: number;

    @IsInt()
    @IsNotEmpty()
    @Min(1)
    plazo_credito: number;

    @IsInt()
    @IsPositive()
    @Max(100)
    @IsNotEmpty()
    tasa_credito: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    tasa_proveedores: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    tmrr: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    tasa_reinversion: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    impuestos_renta: number;

    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    dias_cartera: number;

    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    dias_inventario: number;

    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    dias_pago_proveedores: number;

    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    tarfia_ind_ccio: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(1)
    gmf4xmil: number;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    saldo_min_caja: number;

    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => PropuestaFinancieraDto)
    propuesta_financiera: PropuestaFinancieraDto;
}
