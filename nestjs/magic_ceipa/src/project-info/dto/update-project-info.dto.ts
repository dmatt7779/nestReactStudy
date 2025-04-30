import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectInfoDto, TeamMemberDto } from './create-project-info.dto';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested, ArrayMaxSize, ArrayMinSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectInfoDto extends PartialType(CreateProjectInfoDto) {
  @ApiPropertyOptional({ type: [TeamMemberDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  teamMembers?: TeamMemberDto[]


  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(new Date().getFullYear())
  openingYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  professor?: number[]
}