import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService
    ) {}

    async login({email, password}: LoginDto){
        const isUser = await this.usersService.findOneByEmailWithPwd(email);
        if( !isUser){
            throw new UnauthorizedException("email or password is wrong");
        }
        const isPwdValid = await bcryptjs.compare(password, isUser.password);
        if(!isPwdValid){
            throw new UnauthorizedException("email or password is wrong");
        }
        const payload = { id: isUser.id, email: isUser.email, role: isUser.role };
        const token = await this.jwtService.signAsync(payload);
        return { token, payload };
    }

    async register({name, email, password, role}: RegisterDto){
        const isUser = await this.usersService.findOneByEmail(email);
        if (isUser) {
            throw new BadRequestException("User already exists");
        }
        try{
            await this.usersService.create({
                name,
                email,
                password: await bcryptjs.hash(password, 12),
                role: role || 'user'
            });
            return {
                name,
                email
            }
        }catch (error){
            console.log(error);
        }
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.usersService.findOneByEmail(forgotPasswordDto.email);
        if (!user) {
            return { message: 'Si el correo existe, se han enviado las instrucciones.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 15);

        await this.usersService.saveResetToken(user.id, hashedToken, expiry);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3005';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        try {
            await this.mailerService.sendMail({
                to: user.email,
                from: process.env.MAIL_FROM || '"Magic CEIPA" <no-reply@ceipa.edu.co>',
                subject: 'Recuperación de contraseña - Magic CEIPA',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1a237e; text-align: center;">Recuperación de contraseña</h2>
                        <p>Has solicitado restablecer tu contraseña en la plataforma Plan Financiero CEIPA.</p>
                        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background-color: #1a237e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer contraseña</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Este enlace es válido por 15 minutos.</p>
                        <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                    </div>
                `,
            });
        } catch (error) {
            console.error('Error enviando correo de recuperación:', error);
        }

        return { message: 'Si el correo existe, se han enviado las instrucciones.' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const hashedToken = crypto.createHash('sha256').update(resetPasswordDto.token).digest('hex');
        const user = await this.usersService.findByValidResetToken(hashedToken);
        
        if (!user) {
            throw new BadRequestException('El enlace es inválido o ha expirado');
        }

        const newHashedPassword = await bcryptjs.hash(resetPasswordDto.newPassword, 12);
        await this.usersService.updatePassword(user.id, newHashedPassword);

        return { message: 'Contraseña actualizada exitosamente' };
    }

    async profile(req: UserActiveInterface){
        return await this.usersService.findOneByEmail(req.email)
    }
}
