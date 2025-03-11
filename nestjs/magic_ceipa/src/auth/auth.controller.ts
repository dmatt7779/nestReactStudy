import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from 'src/interfaces/profileGuards.interface';
import { Role } from './enums/rol.enum';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    async register(
        @Body()
        registerDto: RegisterDto
    ){
        return await this.authService.register(registerDto);
    }

    @Post('login')
    async login(
        @Body()
        loginDto: LoginDto,
    ){
        return await this.authService.login(loginDto);
    }

    @Get('profile')
    @Auth(Role.ADMIN)
    async profile(
        @Req()
        req: RequestWithUser,
    ){
        return req.user;
    }
}
