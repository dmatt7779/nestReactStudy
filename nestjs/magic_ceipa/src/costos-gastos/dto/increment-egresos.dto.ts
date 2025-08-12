import { IsArray, IsBoolean, IsOptional } from "class-validator";

export class IncrementoEgresosDto {
    @IsBoolean()
    @IsOptional()
    pib: boolean;

    @IsBoolean()
    @IsOptional()
    ipc: boolean;

    @IsBoolean()
    @IsOptional()
    estrategia: boolean;

    @IsOptional()
    @IsArray()
    incrementoEgresosCantidades: number[];
}
