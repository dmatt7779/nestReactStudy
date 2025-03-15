import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(createUserDto: CreateUserDto) {
    try{
      const user = this.userRepository.create(createUserDto)
      return await this.userRepository.save(user);
    }catch (error){
        console.log(error);
    }
  }

  async findOneByEmail(email: string){
    return await this.userRepository.findOneBy({email})
  }

  async findOneByEmailWithPwd(email: string){
    return await this.userRepository.findOne({
      where: {email},
      select: ['id', 'name', 'email', 'password', 'role']
    })
  }

  async findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
