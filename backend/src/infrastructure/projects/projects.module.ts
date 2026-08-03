import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManageProjectsUseCase } from '../../application/projects/use-cases/manage-projects.use-case';
import { PROJECT_REPOSITORY } from '../../application/projects/ports/project-repository.port';
import { ProjectOrmEntity } from './entities/project.orm-entity';
import { ProjectRepository } from './project.repository';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectOrmEntity])],
  controllers: [ProjectsController],
  providers: [
    ManageProjectsUseCase,
    { provide: PROJECT_REPOSITORY, useClass: ProjectRepository },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectsModule {}
