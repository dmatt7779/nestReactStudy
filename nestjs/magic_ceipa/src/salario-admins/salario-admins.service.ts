import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateSalarioAdminDto } from './dto/create-salario-admin.dto';
import { UpdateSalarioAdminDto } from './dto/update-salario-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SalarioAdmin } from './entities/salario-admin.entity';
import { Repository } from 'typeorm';
import { ProjectInfoService } from '../project-info/project-info.service';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from 'src/common/enums/rol.enum';

@Injectable()
export class SalarioAdminsService {
  constructor(
    @InjectRepository(SalarioAdmin)
    private salarioAdminRepository: Repository<SalarioAdmin>,
    private readonly projectInfoService: ProjectInfoService,
  ){}
  
  async create(createSalarioAdminDto: CreateSalarioAdminDto, projectInfoId: number, user: UserActiveInterface) {
    await this.projectInfoService.findOne(projectInfoId, user);
    
    // UPSERT LOGIC: Check if it already exists
    const existingSalarioAdmin = await this.salarioAdminRepository.findOne({
      where: { projectInfo: { id: projectInfoId } },
    });
    
    if (existingSalarioAdmin) {
      // Hard delete the parent SalarioAdmin block to make room for the new JSON
      await this.salarioAdminRepository.remove(existingSalarioAdmin);
    }

    const dataToStore = {
      salarioAdmins: createSalarioAdminDto.salarioAdmins,
      incrementoSalarial: createSalarioAdminDto.incrementoSalarial,
    };

    const newSalarioAdmin = this.salarioAdminRepository.create({
      salarioAdmins: dataToStore,
      projectInfo: { id: projectInfoId },
      userEmail: user.email,
    });

    return await this.salarioAdminRepository.save(newSalarioAdmin);
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN){
      return await this.salarioAdminRepository.find();
    }
    return await this.salarioAdminRepository.find({
      where: {userEmail: user.email}
    });
  }

  async findOne(projectInfoId: number, user: UserActiveInterface) {
    const salarioAdmin = await this.salarioAdminRepository.findOne({
      where: { projectInfo: { id: projectInfoId } }
    });
    if (!salarioAdmin) {
        throw new NotFoundException(`SalarioAdmin not found`);
    }
    this.validateOwnerShip(salarioAdmin, user)
    return salarioAdmin;
  }

  // async update(id: number, updateSalarioAdminDto: UpdateSalarioAdminDto) {
  //   return await this.salarioAdmin.update(id, updateSalarioAdminDto)
  // }

  async remove(id: number, user: UserActiveInterface) {
    const projectToDelete = await this.findOne(id, user);
    await this.salarioAdminRepository.softDelete({id});
    return projectToDelete;
  }

  private validateOwnerShip(project: SalarioAdmin, user: UserActiveInterface){
    if(user.role !== Role.ADMIN && project.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
