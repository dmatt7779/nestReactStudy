import { Injectable } from '@nestjs/common';
import { CreateProyeccionMacroDto } from './dto/create-proyeccion-macro.dto';
import { UpdateProyeccionMacroDto } from './dto/update-proyeccion-macro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProyeccionMacro } from './entities/proyeccion-macro.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProyeccionMacroService {
  constructor(
      @InjectRepository(ProyeccionMacro)
      private readonly ProyeccionMacro: Repository<ProyeccionMacro>
  ) {}

  async create(createProyeccionMacroDto: CreateProyeccionMacroDto) {
    try{
      const proyeccionMacro = this.ProyeccionMacro.create(createProyeccionMacroDto)
      return await this.ProyeccionMacro.save(proyeccionMacro);
    }catch (error){
        console.log(error);
    }
  }

  async findAll() {
    return await this.ProyeccionMacro.find();
  }

  async findOne(id: number) {
    return await this.ProyeccionMacro.findOneBy({id});
  }

  async update(id: number, updateProyeccionMacroDto: UpdateProyeccionMacroDto) {
    return await this.ProyeccionMacro.update(id, updateProyeccionMacroDto);
  }

  async remove(id: number) {
    return `This action removes a #${id} proyeccionMacro`;
  }
}
