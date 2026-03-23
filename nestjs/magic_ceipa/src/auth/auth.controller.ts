import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '../common/enums/rol.enum';
import { Auth } from './decorators/auth.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';

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

    @Post('forgot-password')
    async forgotPassword(
        @Body()
        forgotPasswordDto: ForgotPasswordDto
    ){
        return await this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    async resetPassword(
        @Body()
        resetPasswordDto: ResetPasswordDto
    ){
        return await this.authService.resetPassword(resetPasswordDto);
    }

    @Get('profile')
    @Auth(Role.ADMIN)
    async profile(@ActiveUser() user: UserActiveInterface){
        return this.authService.profile(user)
    }
}
