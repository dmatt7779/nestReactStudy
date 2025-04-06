import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateProjectInfoDto {
      @IsNotEmpty()
      @IsString()
      @MaxLength(255)
      @IsOptional()
      projectName: string;
    
      @IsNotEmpty()
      @IsArray()
      @IsString({ each: true })
      @ArrayMinSize(1)
      @ArrayMaxSize(5)
      @IsOptional()
      teamMembers: string[];
    
      @IsNotEmpty()
      @IsInt()
      @Min(new Date().getFullYear())
      @IsOptional()
      openingYear: number;
    
      @IsNotEmpty()
      @IsArray()
      @IsNumber({}, { each: true })
      @ArrayMinSize(1)
      @ArrayMaxSize(5)
      @IsOptional()
      professor: number[];
}
