import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from "class-validator";
import { Role } from "../../common/enums/rol.enum";

export class RegisterDto {
    
    @Transform(({value}) => value.trim())
    @IsString()
    @MinLength(1)
    name: string;

    @IsEmail()
    email: string;

    @Transform(({value}) => value.trim())
    @IsString()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role?: string;
}
