import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested, ArrayMaxSize, ArrayMinSize, IsNumber } from 'class-validator';

export class CreateProjectInfoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  projectName: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  teamMembers: string[];

  @IsNotEmpty()
  @IsInt()
  @Min(new Date().getFullYear())
  openingYear: number;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  professor: number[];
}