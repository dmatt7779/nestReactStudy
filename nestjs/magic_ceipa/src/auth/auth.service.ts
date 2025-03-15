import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/enums/rol.enum';
import { RequestWithUser } from 'src/interfaces/profileGuards.interface';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
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
        const payload = { email: isUser.email, role: isUser.role };
        const token = await this.jwtService.signAsync(payload);
        return { token, payload };
    }

    async register({name, email, password}: RegisterDto){
        const isUser = await this.usersService.findOneByEmail(email);
        if (isUser) {
            throw new BadRequestException("User already exists");
        }
        await this.usersService.create({
            name,
            email,
            password: await bcryptjs.hash(password, 12)
        });
        return {
            name, 
            email,
        }
    }

    async profile(req: RequestWithUser){
        return await this.usersService.findOneByEmail(req.user.email)
    }
}
