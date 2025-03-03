import { Injectable } from '@nestjs/common';
import { CreateCostosGastoDto } from './dto/create-costos-gasto.dto';
import { UpdateCostosGastoDto } from './dto/update-costos-gasto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CostosGasto } from './entities/costos-gasto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CostosGastosService {
  constructor(
      @InjectRepository(CostosGasto)
      private readonly costosGasto: Repository<CostosGasto>
  ) {}
  
  async create(createCostosGastoDto: CreateCostosGastoDto) {
    try{
      const proyeccionMacro = this.costosGasto.create(createCostosGastoDto)
      return await this.costosGasto.save(proyeccionMacro);
    }catch (error){
        console.log(error);
    }
  }

  async findAll() {
    return await this.costosGasto.find();
  }

  async findOne(id: number) {
    return await this.costosGasto.findOneBy({id});
  }

  async update(id: number, updateCostosGastoDto: UpdateCostosGastoDto) {
    return await this.costosGasto.update(id, updateCostosGastoDto);
  }

  async remove(id: number) {
    return `This action removes a #${id} costosGasto`;
  }
}
