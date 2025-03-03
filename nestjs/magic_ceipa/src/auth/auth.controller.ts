import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ){}

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
    @UseGuards(AuthGuard)
    async profile(
        @Request()
        req,
    ){
        return req.user;
    }
}
