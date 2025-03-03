import { Injectable } from '@nestjs/common';
import { CreateSalarioAdminDto } from './dto/create-salario-admin.dto';
import { UpdateSalarioAdminDto } from './dto/update-salario-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SalarioAdmin } from './entities/salario-admin.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SalarioAdminsService {
  constructor(
    @InjectRepository(SalarioAdmin)
    private salarioAdmin: Repository<SalarioAdmin>
  ){}
  
  async create(createSalarioAdminDto: CreateSalarioAdminDto) {
    try{
      const proyeccionMacro = this.salarioAdmin.create(createSalarioAdminDto)
      return await this.salarioAdmin.save(proyeccionMacro);
    }catch (error){
        console.log(error);
    }
  }

  async findAll() {
    return await this.salarioAdmin.find();
  }

  async findOne(id: number) {
    return await this.salarioAdmin.findOneBy({id})
  }

  async update(id: number, updateSalarioAdminDto: UpdateSalarioAdminDto) {
    return await this.salarioAdmin.update(id, updateSalarioAdminDto)
  }

  async remove(id: number) {
    return `This action removes a #${id} salarioAdmin`;
  }
}
