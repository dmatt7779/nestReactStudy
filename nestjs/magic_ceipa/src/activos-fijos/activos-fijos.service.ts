import { Injectable } from '@nestjs/common';
import { CreateActivosFijoDto } from './dto/create-activos-fijo.dto';
import { UpdateActivosFijoDto } from './dto/update-activos-fijo.dto';
import { ActivoFijo } from './entities/activos-fijo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ActivosFijosService {

  constructor(
    @InjectRepository(ActivoFijo)
    private readonly activoFijo: Repository<ActivoFijo>
  ) { }

  async create(createActivosFijoDto: CreateActivosFijoDto) {
    try {
      const projectInfo = this.activoFijo.create(createActivosFijoDto)
      return await this.activoFijo.save(projectInfo);
    } catch (error) {
      console.log(error);
    }
  }

  async findAll() {
    return await this.activoFijo.find();
  }

  async findOne(id: number) {
    return await this.activoFijo.findOneBy({id});
  }

  async update(id: number, updateActivosFijoDto: UpdateActivosFijoDto) {
    return await this.activoFijo.update(id, updateActivosFijoDto)
  }

  async remove(id: number) {
    return `This action removes a #${id} activosFijo`;
  }
}
