import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
export class CostoGastoItemDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @Min(0)
  valor: number;
}