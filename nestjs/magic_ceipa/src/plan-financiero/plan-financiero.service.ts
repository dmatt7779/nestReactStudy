import { Injectable } from '@nestjs/common';
import { CreatePlanFinancieroDto } from './dto/create-plan-financiero.dto';
import { UpdatePlanFinancieroDto } from './dto/update-plan-financiero.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanFinanciero } from './entities/plan-financiero.entity';

@Injectable()
export class PlanFinancieroService {
  constructor(
    @InjectRepository(PlanFinanciero)
    private readonly planFinanciero: Repository<PlanFinanciero>
  ) {}

  async create(createPlanFinancieroDto: CreatePlanFinancieroDto) {
    try{
      const proyeccionMacro = this.planFinanciero.create(createPlanFinancieroDto)
      return await this.planFinanciero.save(proyeccionMacro);
    }catch (error){
        console.log(error);
    }
  }

  async findAll() {
    return await this.planFinanciero.find();
  }

  async findOne(id: number) {
    return await this.planFinanciero.findOneBy({id});
  }

  async update(id: number, updatePlanFinancieroDto: UpdatePlanFinancieroDto) {
    return await this.planFinanciero.update(id, updatePlanFinancieroDto);
  }

  async remove(id: number) {
    return `This action removes a #${id} planFinanciero`;
  }
}
