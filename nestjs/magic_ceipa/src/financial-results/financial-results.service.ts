import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialResult } from './entities/financial-result.entity';
import { CreateFinancialResultDto } from './dto/create-financial-result.dto';
import { UpdateFinancialResultDto } from './dto/update-financial-result.dto';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/rol.enum';

@Injectable()
export class FinancialResultsService {
  constructor(
    @InjectRepository(FinancialResult)
    private readonly financialResultRepository: Repository<FinancialResult>,
  ) {}

  async create(createFinancialResultDto: CreateFinancialResultDto, projectInfoId: number, user: UserActiveInterface) {
    // Si ya existe un resultado para este proyecto, actualizarlo
    const existing = await this.financialResultRepository.findOne({
      where: { projectInfoId },
    });

    if (existing) {
      await this.financialResultRepository.update(existing.id, {
        result: createFinancialResultDto.result,
      });
      return this.financialResultRepository.findOne({ where: { id: existing.id } });
    }

    const financialResult = this.financialResultRepository.create({
      result: createFinancialResultDto.result,
      projectInfoId,
      userEmail: user.email,
    });

    return await this.financialResultRepository.save(financialResult);
  }

  async findAll(user: UserActiveInterface) {
    if (user.role === Role.ADMIN) {
      return await this.financialResultRepository.find();
    }
    return await this.financialResultRepository.find({
      where: { userEmail: user.email },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const financialResult = await this.financialResultRepository.findOne({
      where: { id },
    });

    if (!financialResult) {
      throw new NotFoundException('Financial result not found');
    }

    this.validateOwnership(financialResult, user);
    return financialResult;
  }

  async findByProject(projectInfoId: number, user: UserActiveInterface) {
    const financialResult = await this.financialResultRepository.findOne({
      where: { projectInfoId },
    });

    if (!financialResult) {
      throw new NotFoundException('Financial result not found for this project');
    }

    this.validateOwnership(financialResult, user);
    return financialResult;
  }

  async update(id: number, updateFinancialResultDto: UpdateFinancialResultDto, user: UserActiveInterface) {
    await this.findOne(id, user);

    if (updateFinancialResultDto.result) {
      await this.financialResultRepository.update(id, {
        result: updateFinancialResultDto.result,
      });
    }

    return this.findOne(id, user);
  }

  async remove(id: number, user: UserActiveInterface) {
    const financialResult = await this.findOne(id, user);
    await this.financialResultRepository.delete(id);
    return financialResult;
  }

  private validateOwnership(financialResult: FinancialResult, user: UserActiveInterface) {
    if (user.role !== Role.ADMIN && financialResult.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
