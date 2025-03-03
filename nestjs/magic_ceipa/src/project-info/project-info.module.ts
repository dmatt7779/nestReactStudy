import { Module } from '@nestjs/common';
import { ProjectInfoService } from './project-info.service';
import { ProjectInfoController } from './project-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfo } from './entities/project-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectInfo])],
  controllers: [ProjectInfoController],
  providers: [ProjectInfoService],
})
export class ProjectInfoModule {}
