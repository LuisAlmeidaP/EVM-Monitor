import { Project } from '../../../domain/projects/project';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface ProjectRepositoryPort {
  save(project: Project): Promise<Project>;
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  delete(id: string): Promise<void>;
}
