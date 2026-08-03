import { Inject, Injectable } from '@nestjs/common';
import { Project } from '../../../domain/projects/project';
import { ResourceNotFoundException } from '../../exceptions/resource-not-found.exception';
import { PROJECT_REPOSITORY } from '../ports/project-repository.port';
import type { ProjectRepositoryPort } from '../ports/project-repository.port';

@Injectable()
export class ManageProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
  ) {}

  async create(name: string): Promise<Project> {
    const project = Project.create(name);
    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new ResourceNotFoundException(
        `No se encontró un proyecto con el identificador "${id}".`,
      );
    }

    return project;
  }

  async update(id: string, name: string): Promise<Project> {
    const project = await this.findById(id);
    project.rename(name);
    return this.projectRepository.save(project);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.projectRepository.delete(id);
  }
}
