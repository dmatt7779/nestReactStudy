import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested, ArrayMaxSize, ArrayMinSize, IsNumber } from 'class-validator';

export class TeamMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  id: string;
}

export class CreateProjectInfoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  projectName: string;

  @ApiProperty({ type: [TeamMemberDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  @ArrayMaxSize(5)
  teamMembers: TeamMemberDto[];

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