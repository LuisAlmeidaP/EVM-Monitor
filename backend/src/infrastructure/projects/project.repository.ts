import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Project } from '../../domain/projects/project';
import type { ProjectRepositoryPort } from '../../application/projects/ports/project-repository.port';
import { ProjectOrmEntity } from './entities/project.orm-entity';

@Injectable()
export class ProjectRepository implements ProjectRepositoryPort {
  constructor(
    @InjectRepository(ProjectOrmEntity)
    private readonly repository: Repository<ProjectOrmEntity>,
  ) {}

  async save(project: Project): Promise<Project> {
    const saved = await this.repository.save(this.toOrmEntity(project));
    return this.toDomain(saved);
  }

  async findAll(): Promise<Project[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Project | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: ProjectOrmEntity): Project {
    return Project.reconstitute(entity.id, entity.name);
  }

  private toOrmEntity(project: Project): ProjectOrmEntity {
    const ormEntity = new ProjectOrmEntity();
    ormEntity.id = project.id;
    ormEntity.name = project.name;
    return ormEntity;
  }
}
