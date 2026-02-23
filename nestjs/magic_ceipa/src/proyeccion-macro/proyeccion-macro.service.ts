import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProyeccionMacroDto } from './dto/create-proyeccion-macro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProyeccionMacro } from './entities/proyeccion-macro.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserActiveInterface } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/rol.enum';
import { ProjectInfoService } from '../project-info/project-info.service';
import { EstrategiaMarketing } from './entities/estrategia-marketing.entity';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProyeccionMacroService {
  constructor(
      @InjectRepository(ProyeccionMacro)
      private readonly proyeccionMacroRepository: Repository<ProyeccionMacro>,
      @InjectRepository(EstrategiaMarketing)
      private readonly estrategiaMarketingRepository: Repository<EstrategiaMarketing>,
      @InjectRepository(Producto)
      private readonly productoRepository: Repository<Producto>,
      private readonly projectInfoService: ProjectInfoService,
  ) {}

  async create(createProyeccionMacroDto: CreateProyeccionMacroDto, projectInfoId: number, user: UserActiveInterface) {
    await this.projectInfoService.findOne(projectInfoId, user);
    
    // UPSERT LOGIC: Check if it already exists
    const existingProyeccion = await this.proyeccionMacroRepository.findOne({
      where: { projectInfoId },
      relations: ['producto', 'estrategiaMarketing'],
    });

    if (existingProyeccion) {
      // 1. Hard delete related arrays to prevent orphans
      if (existingProyeccion.estrategiaMarketing && existingProyeccion.estrategiaMarketing.length > 0) {
        await this.estrategiaMarketingRepository.remove(existingProyeccion.estrategiaMarketing);
      }
      if (existingProyeccion.producto && existingProyeccion.producto.length > 0) {
        await this.productoRepository.remove(existingProyeccion.producto);
      }
      
      // 2. Hard delete the parent ProyeccionMacro to make room for the fresh one
      await this.proyeccionMacroRepository.remove(existingProyeccion);
    }
    
    const { analisisMercado, proyeccionesMacroeconomicas } = createProyeccionMacroDto;
    const { productos, estrategiaMarketing, ...restOfAnalisisMercado } = analisisMercado;
    
    // Create new fresh instance (Insert)
    const proyeccionMacro = this.proyeccionMacroRepository.create({
      proyeccionesMacroeconomicas,
      analisisMercado: restOfAnalisisMercado, 
      projectInfo: { id: projectInfoId },
      userEmail: user.email,
    });

    const savedProyeccion = await this.proyeccionMacroRepository.save(proyeccionMacro);
    
    if (estrategiaMarketing && estrategiaMarketing.length > 0) {
      const estrategias = estrategiaMarketing.map(dto => 
        this.estrategiaMarketingRepository.create({
          ...dto,
          proyeccionMacro: savedProyeccion, 
        })
      );
      await this.estrategiaMarketingRepository.save(estrategias);
    }
    
    if (productos && productos.length > 0) {
        const productosEntidades = productos.map(dto => 
            this.productoRepository.create({
                ...dto,
                proyeccionMacro: savedProyeccion,
            })
        );
        await this.productoRepository.save(productosEntidades);
    }
    return this.findOne(projectInfoId, user);
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN){
      return await this.proyeccionMacroRepository.find();
    }
    return await this.proyeccionMacroRepository.find({
      where: {userEmail: user.email}
    });
  }

  async findOne(projectInfoId: number, user: UserActiveInterface) {
      const proyeccionMacro = await this.proyeccionMacroRepository.findOne({
        where: { projectInfoId },
        relations: ['producto', 'estrategiaMarketing'],
      })
      
      if (!proyeccionMacro) {
        throw new NotFoundException('Project is not found');
      }
      this.validateOwnerShip(proyeccionMacro, user);
      return proyeccionMacro;
  }

  async update(id: number, updateProyeccionMacroDto) {
    const where: FindOptionsWhere<ProyeccionMacro> = { id };
    return await this.proyeccionMacroRepository.update(where, updateProyeccionMacroDto);
  }

  async remove(id: number, user: UserActiveInterface) {
    const projectToDelete = await this.findOne(id, user);
    await this.proyeccionMacroRepository.softDelete({id});
    return projectToDelete;
  }

  private validateOwnerShip(project: ProyeccionMacro, user: UserActiveInterface){
    if(user.role !== Role.ADMIN && project.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
