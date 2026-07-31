import { Project } from '../../../domain/projects/project';

export class ProjectResponseDto {
  readonly id: string;
  readonly nombre: string;

  private constructor(id: string, nombre: string) {
    this.id = id;
    this.nombre = nombre;
  }

  static fromDomain(project: Project): ProjectResponseDto {
    return new ProjectResponseDto(project.id, project.name);
  }
}
